export const DEFAULT_CHAT_MODEL = "deepseek-ai/deepseek-v4-pro";

export type ModelCapabilities = {
  tools: boolean;
  vision: boolean;
  reasoning: boolean;
};

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
  reasoningEffort?: "none" | "minimal" | "low" | "medium" | "high";
};

export const chatModels: ChatModel[] = [
  // ═══════════════════════════════════════
  // ANTHROPIC (Puter)
  // ═══════════════════════════════════════
  {
    description: "Anthropic's most capable agentic model with 1M context",
    id: "claude-fable-5",
    name: "Claude Fable 5",
    provider: "anthropic",
  },
  {
    description: "Flagship model for complex coding & reasoning",
    id: "claude-opus-4-8",
    name: "Claude Opus 4.8",
    provider: "anthropic",
  },
  {
    description: "Balanced high-efficiency model (Jun 2026)",
    id: "claude-sonnet-5",
    name: "Claude Sonnet 5",
    provider: "anthropic",
  },
  {
    description: "Fast and capable Claude model",
    id: "claude-sonnet-4-20250514",
    name: "Claude Sonnet 4",
    provider: "anthropic",
  },
  {
    description: "Fastest Claude model for quick tasks",
    id: "claude-3-5-haiku-20241022",
    name: "Claude 3.5 Haiku",
    provider: "anthropic",
  },

  // ═══════════════════════════════════════
  // OPENAI (Puter)
  // ═══════════════════════════════════════
  {
    description: "OpenAI's flagship model for agentic coding",
    id: "gpt-5.6-sol",
    name: "GPT-5.6 Sol",
    provider: "openai",
  },
  {
    description: "Balanced GPT-5.6 variant",
    id: "gpt-5.6-terra",
    name: "GPT-5.6 Terra",
    provider: "openai",
  },
  {
    description: "Compact GPT-5.6 variant",
    id: "gpt-5.6-luna-pro",
    name: "GPT-5.6 Luna Pro",
    provider: "openai",
  },
  {
    description: "Fast and capable GPT model",
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
  },
  {
    description: "Lightweight affordable GPT model",
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
  },
  {
    description: "OpenAI reasoning model",
    id: "o4-mini",
    name: "o4 Mini",
    provider: "openai",
    reasoningEffort: "medium",
  },

  // ═══════════════════════════════════════
  // GOOGLE (Puter)
  // ═══════════════════════════════════════
  {
    description: "Google's most advanced model",
    id: "gemini-3.5-pro",
    name: "Gemini 3.5 Pro",
    provider: "google",
  },
  {
    description: "Google's fast flash model",
    id: "gemini-2.5-flash-preview-05-20",
    name: "Gemini 2.5 Flash",
    provider: "google",
  },
  {
    description: "Google's efficient flash model",
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "google",
  },

  // ═══════════════════════════════════════
  // XAI (Puter)
  // ═══════════════════════════════════════
  {
    description: "xAI's latest Grok model (Jul 2026)",
    id: "grok-4.5",
    name: "Grok 4.5",
    provider: "xai",
  },
  {
    description: "Fast Grok model",
    id: "grok-3-mini",
    name: "Grok 3 Mini",
    provider: "xai",
  },

  // ═══════════════════════════════════════
  // DEEPSEEK (Puter)
  // ═══════════════════════════════════════
  {
    description: "DeepSeek's powerful chat model",
    id: "deepseek-chat",
    name: "DeepSeek Chat",
    provider: "deepseek",
  },
  {
    description: "DeepSeek's reasoning model",
    id: "deepseek-reasoner",
    name: "DeepSeek Reasoner",
    provider: "deepseek",
    reasoningEffort: "high",
  },
  {
    description: "DeepSeek's 2026 flagship pro model",
    id: "deepseek-v4-pro",
    name: "DeepSeek V4 Pro",
    provider: "deepseek",
  },

  // ═══════════════════════════════════════
  // META (Puter)
  // ═══════════════════════════════════════
  {
    description: "Meta's creative Muse model",
    id: "meta/muse-spark-1.1",
    name: "Muse Spark 1.1",
    provider: "meta",
  },
  {
    description: "Meta's Llama 4 Maverick model",
    id: "meta-llama/llama-4-maverick",
    name: "Llama 4 Maverick",
    provider: "meta",
  },

  // ═══════════════════════════════════════
  // MOONSHOT AI (Puter)
  // ═══════════════════════════════════════
  {
    description: "Moonshot AI's coding-focused model",
    id: "moonshotai/kimi-k2.7-code",
    name: "Kimi K2.7 Code",
    provider: "moonshot",
  },

  // ═══════════════════════════════════════
  // MISTRAL (Puter)
  // ═══════════════════════════════════════
  {
    description: "Mistral's flagship model",
    id: "mistral-large-latest",
    name: "Mistral Large",
    provider: "mistral",
  },

  // ═══════════════════════════════════════
  // NVIDIA NIM (Free Open-Source Flagships)
  // ═══════════════════════════════════════
  {
    description: "NVIDIA's Nemotron 70B instruct model",
    id: "nvidia/llama-3.1-nemotron-70b-instruct",
    name: "Nemotron 70B",
    provider: "nvidia",
  },
  {
    description: "DeepSeek V4 Pro on NIM",
    id: "deepseek-ai/deepseek-v4-pro",
    name: "DeepSeek V4 Pro (NIM)",
    provider: "nvidia",
    reasoningEffort: "high",
  },
  {
    description: "Llama 3.3 70B Instruct on NIM",
    id: "meta/llama-3.3-70b-instruct",
    name: "Llama 3.3 (NIM)",
    provider: "nvidia",
  },
  {
    description: "Mistral Large 3 on NIM",
    id: "mistralai/mistral-large-3-675b-instruct-2512",
    name: "Mistral Large 3 (NIM)",
    provider: "nvidia",
  },
  {
    description: "Qwen 3.5 72B Instruct on NIM",
    id: "qwen/qwen-3.5-72b-instruct",
    name: "Qwen 3.5 (NIM)",
    provider: "nvidia",
  },
];

export const titleModel = {
  description: "Fast model for title generation",
  id: "gpt-4o-mini",
  name: "GPT-4o Mini",
  provider: "openai",
};

export function getActiveModels(): ChatModel[] {
  return chatModels;
}

export const allowedModelIds = new Set(chatModels.map((m) => m.id));

export const modelsByProvider = chatModels.reduce(
  (acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  },
  {} as Record<string, ChatModel[]>
);

// Simplified capabilities - Puter handles this
export async function getCapabilities(): Promise<
  Record<string, ModelCapabilities>
> {
  return Object.fromEntries(
    chatModels.map((model) => [
      model.id,
      {
        reasoning: model.reasoningEffort !== undefined,
        tools: true,
        vision: [
          "claude-fable-5",
          "claude-opus-4-8",
          "claude-sonnet-5",
          "claude-sonnet-4-20250514",
          "gpt-5.6-sol",
          "gpt-5.6-terra",
          "gpt-4o",
          "gpt-4o-mini",
          "gemini-3.5-pro",
          "gemini-2.5-flash-preview-05-20",
          "gemini-2.0-flash",
          "grok-4.5",
          "deepseek-v4-pro",
        ].includes(model.id),
      },
    ])
  );
}

export type ModelAvailability = "healthy" | "impacted" | "unknown";

export async function getModelAvailability(
  _modelId: string
): Promise<ModelAvailability> {
  return "healthy";
}
