import { chatModels, getCapabilities } from "@/lib/ai/models"; // Force rebuild

export async function GET(request: Request) {
  // Read request to force dynamic rendering and bypass Next.js static cache
  const _url = new URL(request.url);

  const headers = {
    "Cache-Control": "no-store, max-age=0",
  };

  const capabilities = await getCapabilities();

  return Response.json(
    {
      capabilities,
      models: chatModels.map((m) => ({
        ...m,
        capabilities: capabilities[m.id] || {
          reasoning: false,
          tools: true,
          vision: false,
        },
      })),
    },
    { headers }
  );
}
