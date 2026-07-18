"use server";

import type { UIMessage } from "ai";
import { cookies } from "next/headers";
import { auth } from "@/lib/firebase-admin";
import type { VisibilityType } from "@/components/chat/visibility-selector";
import {
  deleteMessagesByChatIdAfterTimestamp,
  getChatById,
  getMessageById,
  updateChatVisibilityById,
  updateChatTitleById,
} from "@/lib/db/queries";
import { getTextFromMessage } from "@/lib/utils";

export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set("chat-model", model);
}

export async function generateTitleFromUserMessage({
  message,
}: {
  message: UIMessage;
}) {
  const text = getTextFromMessage(message);
  if (!text) return "New chat";

  try {
    const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || "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";
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${NVIDIA_API_KEY}`,
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-8b-instruct",
        messages: [
          { role: "system", content: "You are a title generator. Generate a short, 3-6 word title for the user's message. Do not use quotes, punctuation, or extra conversational text." },
          { role: "user", content: text }
        ],
        temperature: 0.3,
        max_tokens: 15,
        stream: false,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const generatedTitle = data.choices?.[0]?.message?.content?.trim();
      if (generatedTitle) {
        return generatedTitle.replace(/^["']|["']$/g, '');
      }
    }
  } catch (error) {
    console.error("Title generation error:", error);
  }

  // Fallback
  const title = text.slice(0, 50).trim();
  return title.length < text.length ? `${title}...` : title;
}

export async function generateAndSaveTitle({
  chatId,
  title,
}: {
  chatId: string;
  title: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const chat = await getChatById({ id: chatId });
  if (!chat || chat.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  await updateChatTitleById({ id: chatId, title });
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const message = await getMessageById({ id });
  if (!message) {
    throw new Error("Message not found");
  }

  const chat = await getChatById({ id: message.chatId });
  if (!chat || chat.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  await deleteMessagesByChatIdAfterTimestamp({
    chatId: message.chatId,
    timestamp: message.createdAt,
  });
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const chat = await getChatById({ id: chatId });
  if (!chat || chat.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }

  await updateChatVisibilityById({ id: chatId, visibility });
}
