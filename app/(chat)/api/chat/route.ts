import { ipAddress } from "@vercel/functions";
import { generateId } from "ai";
import { after } from "next/server";
import { createResumableStreamContext } from "resumable-stream";
import { auth } from "@/lib/firebase-admin";
import { entitlementsByUserType, type UserType } from "@/lib/ai/entitlements";
import {
  allowedModelIds,
  DEFAULT_CHAT_MODEL,
} from "@/lib/ai/models";
import { isProductionEnvironment } from "@/lib/constants";
import {
  createStreamId,
  deleteChatById,
  getChatById,
  getMessageCountByUserId,
  getMessagesByChatId,
  saveChat,
  saveMessages,
  updateChatTitleById,
  updateMessage,
} from "@/lib/db/queries";
import { ChatbotError } from "@/lib/errors";
import { checkIpRateLimit } from "@/lib/ratelimit";
import { generateUUID } from "@/lib/utils";

import { generateTitleFromUserMessage } from "../../actions";
import { type PostRequestBody, postRequestBodySchema } from "./schema";

export const maxDuration = 60;

function getStreamContext() {
  try {
    return createResumableStreamContext({ waitUntil: after });
  } catch {
    return null;
  }
}

export { getStreamContext };

/**
 * POST /api/chat
 * 
 * In the Puter architecture, this endpoint:
 * 1. Validates the request & rate limits
 * 2. Creates the chat if new
 * 3. Saves user messages
 * 4. Returns chat metadata (AI inference happens client-side via Puter.js)
 */
export async function POST(request: Request) {
  let requestBody: PostRequestBody;

  try {
    const json = await request.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch {
    return new ChatbotError("bad_request:api").toResponse();
  }

  try {
    const { id, message, messages, selectedChatModel, selectedVisibilityType } =
      requestBody;

    const session = await auth();

    if (!session?.user) {
      return new ChatbotError("unauthorized:chat").toResponse();
    }

    const chatModel = allowedModelIds.has(selectedChatModel)
      ? selectedChatModel
      : DEFAULT_CHAT_MODEL;

    const ip = ipAddress(request) || "Unknown";
    
    // Dynamically import to safely access Firebase client SDKs from server
    const { isAdminUser } = await import("@/lib/firebase");
    const { getAdminSettings } = await import("@/lib/admin-tracking");
    
    const isAdmin = isAdminUser(session.user.email);
    const adminSettings = await getAdminSettings();

    // Enforce IP and Account Bans (Admins cannot be banned by their own rules)
    if (!isAdmin) {
      if (adminSettings.bannedIps?.includes(ip)) {
        return new ChatbotError("forbidden:chat").toResponse();
      }
      if (adminSettings.bannedEmails?.includes(session.user.email || "")) {
        return new ChatbotError("forbidden:chat").toResponse();
      }
    }

    // NIM (open-source) models are free — skip rate limits for them
    const isNimModel = chatModel.startsWith("nvidia/") || chatModel.startsWith("deepseek-ai/") || chatModel.startsWith("qwen/") || chatModel.startsWith("meta/");

    // Skip all rate limits for admins and NIM models
    if (!isAdmin && !isNimModel) {
      await checkIpRateLimit(ip);

      const messageCount = await getMessageCountByUserId({
        id: session.user.id,
      });

      if (messageCount > adminSettings.defaultLimit) {
        return new ChatbotError("rate_limit:chat").toResponse();
      }
    }

    const chat = await getChatById({ id });
    let titleText: string | null = null;

    // Track user activity in Firebase for admin dashboard
    const location = request.headers.get("x-vercel-ip-city") || "Unknown";
    
    // Dynamically import to avoid edge runtime issues if firebase uses node APIs
    import("@/lib/admin-tracking").then(({ trackUserActivity }) => {
      trackUserActivity({
        userId: session.user.id,
        email: session.user.email || "Unknown",
        ip,
        location,
      });
    }).catch(e => console.error("Tracking error:", e));

    if (chat) {
      if (chat.userId !== session.user.id) {
        return new ChatbotError("forbidden:chat").toResponse();
      }
    } else if (message?.role === "user") {
      await saveChat({
        id,
        title: "New chat",
        userId: session.user.id,
      });
      // Generate simple title from message
      titleText = await generateTitleFromUserMessage({ message });
      if (titleText) {
        await updateChatTitleById({ id, title: titleText });
      }

      import("@/lib/admin-tracking").then(({ incrementChatCount }) => {
        incrementChatCount(session.user.id);
      }).catch(e => console.error("Tracking error:", e));
    }

    // Save user message
    if (message?.role === "user") {
      await saveMessages({
        messages: [
          {
            attachments: [],
            chatId: id,
            createdAt: new Date(),
            id: message.id,
            parts: message.parts,
            role: "user",
          },
        ],
      });
    }

    // Return success with chat metadata
    // AI inference happens client-side via Puter.js or NVIDIA NIM
    return Response.json({
      chatId: id,
      model: chatModel,
      title: titleText,
      status: "ready",
    });
  } catch (error) {
    if (error instanceof ChatbotError) {
      return error.toResponse();
    }

    console.error("Unhandled error in chat API:", error);
    return new ChatbotError("offline:chat").toResponse();
  }
}

/**
 * PUT /api/chat
 * Save assistant response messages after client-side AI inference
 */
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new ChatbotError("unauthorized:chat").toResponse();
    }

    const body = await request.json();
    const { chatId, messages: assistantMessages } = body;

    if (!chatId || !assistantMessages?.length) {
      return new ChatbotError("bad_request:api").toResponse();
    }

    const chat = await getChatById({ id: chatId });
    if (!chat || chat.userId !== session.user.id) {
      return new ChatbotError("forbidden:chat").toResponse();
    }

    await saveMessages({
      messages: assistantMessages.map((msg: any) => ({
        attachments: [],
        chatId,
        createdAt: new Date(),
        id: msg.id || generateUUID(),
        parts: msg.parts || [{ type: "text", text: msg.content || "" }],
        role: msg.role || "assistant",
      })),
    });

    return Response.json({ status: "saved" });
  } catch (error) {
    if (error instanceof ChatbotError) {
      return error.toResponse();
    }
    console.error("Error saving assistant message:", error);
    return new ChatbotError("offline:chat").toResponse();
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new ChatbotError("bad_request:api").toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatbotError("unauthorized:chat").toResponse();
  }

  const chat = await getChatById({ id });

  if (chat?.userId !== session.user.id) {
    return new ChatbotError("forbidden:chat").toResponse();
  }

  const deletedChat = await deleteChatById({ id });

  return Response.json(deletedChat, { status: 200 });
}
