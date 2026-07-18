const url = "https://integrate.api.nvidia.com/v1/chat/completions";
const models = [
  "nvidia/llama-3.1-nemotron-70b-instruct",
  "deepseek-ai/deepseek-v4-pro"
];

async function testModel(modelId) {
  console.log(`\n--- Testing ${modelId} ---`);
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    
    const payload = {
      messages: [{ role: "user", content: "Hello" }],
      model: modelId,
      stream: true
    };
    if (modelId === "deepseek-ai/deepseek-v4-pro") {
      payload.chat_template_kwargs = { thinking: false };
    }
    
    const res = await fetch(url, {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer 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"
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeout);
    
    console.log(`Status: ${res.status}`);
    const text = await res.text();
    console.log(`Body: ${text.slice(0, 100)}...`);
  } catch (e) {
    console.log(`Failed: ${e.message}`);
  }
}

async function run() {
  for (const model of models) {
    await testModel(model);
  }
}

run();
