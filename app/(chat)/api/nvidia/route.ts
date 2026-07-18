/**
 * NVIDIA NIM API Proxy Route
 * 
 * Proxies requests to NVIDIA's OpenAI-compatible API
 * for open-source models (DeepSeek R1, Nemotron, Qwen, etc.)
 */

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || "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";
const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, model, temperature, max_tokens, stream = true } = body;

    if (!messages || !model) {
      return new Response("Missing required fields", { status: 400 });
    }

    const payload: any = {
      messages,
      model,
      temperature,
      max_tokens: max_tokens ?? 4096,
      stream,
    };

    if (model === "deepseek-ai/deepseek-v4-pro") {
      payload.chat_template_kwargs = { thinking: false };
    }

    const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${NVIDIA_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("NVIDIA NIM error:", errorText);
      return new Response(`NVIDIA NIM error: ${response.statusText}`, {
        status: response.status,
      });
    }

    if (stream && response.body) {
      // Forward the SSE stream
      return new Response(response.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("NVIDIA NIM proxy error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
