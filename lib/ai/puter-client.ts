/**
 * Puter AI Client Wrapper
 * 
 * Client-side wrapper for the Puter.js AI SDK.
 * Handles chat completions with streaming support.
 * 
 * Puter models are called via: puter.ai.chat()
 * NVIDIA NIM models are called via server-side API (OpenAI-compatible)
 */

declare global {
  interface Window {
    puter: {
      ai: {
        chat: (
          messagesOrPrompt: any,
          options?: any,
        ) => Promise<any>;
        listModels: () => Promise<any[]>;
      };
    };
  }
}

export type PuterMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
};

export type PuterChatOptions = {
  model?: string;
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
};

// NVIDIA NIM models use server-side API
const NVIDIA_MODEL_PREFIXES = [
  "nvidia/",
  "deepseek-ai/",
  "qwen/",
  "meta/",
  "mistralai/",
];

export function isNvidiaModel(modelId: string): boolean {
  return NVIDIA_MODEL_PREFIXES.some((prefix) => modelId.startsWith(prefix));
}

/**
 * Send a chat message via Puter AI (client-side)
 * Returns an async generator for streaming responses
 */
export async function* puterChat(
  messages: PuterMessage[],
  options: PuterChatOptions = {}
): AsyncGenerator<string> {
  const puter = window.puter;

  if (!puter?.ai?.chat) {
    throw new Error(
      "Puter.js is not loaded. Please ensure the Puter SDK script is included."
    );
  }

  const chatOptions: Record<string, unknown> = {
    model: options.model || "claude-sonnet-4-20250514",
    stream: options.stream !== false, // default true
  };

  if (options.temperature !== undefined) {
    chatOptions.temperature = options.temperature;
  }
  if (options.max_tokens !== undefined) {
    chatOptions.max_tokens = options.max_tokens;
  }

  try {
    if (chatOptions.stream) {
      const response = await puter.ai.chat(messages, chatOptions);

      for await (const part of response) {
        if (part?.text) {
          yield part.text;
        } else if (typeof part === "string") {
          yield part;
        }
      }
    } else {
      const response = await puter.ai.chat(messages, chatOptions);
      const text =
        response?.message?.content ||
        response?.text ||
        (typeof response === "string" ? response : "");
      yield text;
    }
  } catch (error: any) {
    throw new Error(
      error?.message || "Failed to get response from Puter AI"
    );
  }
}

/**
 * Send chat to NVIDIA NIM (server-side proxy)
 */
export async function* nvidiaNimChat(
  messages: PuterMessage[],
  options: PuterChatOptions = {}
): AsyncGenerator<string> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/nvidia`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages,
        model: options.model,
        temperature: options.temperature,
        max_tokens: options.max_tokens,
        stream: options.stream !== false,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    yield `**Error:** Failed to communicate with NVIDIA NIM API. (${response.statusText})\n\nDetails: ${errorText}`;
    return;
  }

  if (options.stream !== false && response.body) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        // flush anything remaining if needed, though SSE usually ends cleanly
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      
      // The last line might be incomplete, keep it in the buffer
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        
        const data = line.startsWith("data: ") ? line.slice(6).trim() : line.slice(5).trim();
        if (data === "[DONE]") return;
        
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) yield content;
        } catch (e) {
          console.error("DEBUG_JSON_PARSE_ERROR_SSE:", e, "Data:", data);
        }
      }
    }
  } else {
    try {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";
      yield content;
    } catch (e) {
      console.error("DEBUG_JSON_PARSE_ERROR_FULL:", e);
      throw e;
    }
  }
}

/**
 * Universal chat function — routes to Puter or NVIDIA NIM
 */
export async function* universalChat(
  messages: PuterMessage[],
  options: PuterChatOptions = {}
): AsyncGenerator<string> {
  const modelId = options.model || "claude-sonnet-4-20250514";

  if (isNvidiaModel(modelId)) {
    yield* nvidiaNimChat(messages, options);
  } else {
    yield* puterChat(messages, options);
  }
}

/**
 * Fetch available models from Puter
 */
export async function fetchPuterModels(): Promise<any[]> {
  try {
    const puter = window.puter;
    if (puter?.ai?.listModels) {
      return await puter.ai.listModels();
    }
    return [];
  } catch {
    return [];
  }
}
