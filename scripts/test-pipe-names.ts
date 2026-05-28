const apiKey = process.env.LANGBASE_API_KEY!;

async function main() {
  // Try different pipe names from the list
  const names = [
    "support-agent-gem-v2",
    "support-agent",
    "ai-support-agent",
    "support-agent-gem",
    "support-agent-g",
  ];

  for (const name of names) {
    const res = await fetch("https://api.langbase.com/v1/pipes/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        name,
        messages: [{ role: "user", content: "Say hello in one word." }],
        stream: false,
      }),
    });

    const body = await res.text();
    console.log(`${name}: ${res.status} ${body.length < 200 ? body : body.slice(0, 200)}`);
  }
}

main().catch(console.error);
