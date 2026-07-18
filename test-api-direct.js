const url = "https://integrate.api.nvidia.com/v1/chat/completions";

async function test() {
  console.log("Fetching...", url);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer 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"
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello" }],
        model: "meta/llama-3.1-70b-instruct",
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
