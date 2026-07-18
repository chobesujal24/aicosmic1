const url = "http://localhost:3000/api/nvidia";

async function test() {
  console.log("Fetching...", url);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello" }],
        model: "deepseek-ai/deepseek-v4-pro",
        stream: true
      })
    });
    console.log("Status:", res.status);
    
    if (res.ok) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
            const {done, value} = await reader.read();
            if (done) {
                console.log("DONE");
                break;
            }
            console.log("CHUNK:", decoder.decode(value));
        }
    } else {
        console.log("Error body:", await res.text());
    }
  } catch (e) {
    console.error("Fetch failed:", e);
  }
}

test();
