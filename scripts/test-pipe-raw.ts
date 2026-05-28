const apiKey = process.env.LANGBASE_API_KEY!;

async function main() {
  // Try the v1 API directly to see the full error
  const res = await fetch("https://api.langbase.com/v1/pipes/run", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: "Say hello in one word." }],
      stream: false,
    }),
  });

  console.log("Status:", res.status);
  const body = await res.text();
  console.log("Body:", body);

  // Also try with pipe name
  const res2 = await fetch("https://api.langbase.com/v1/pipes/run", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      name: "support-agent-gem-v2",
      messages: [{ role: "user", content: "Say hello in one word." }],
      stream: false,
    }),
  });

  console.log("\nWith name - Status:", res2.status);
  const body2 = await res2.text();
  console.log("Body:", body2);

  // Try the beta endpoint too
  const res3 = await fetch("https://api.langbase.com/beta/pipes/run", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      name: "support-agent-gem-v2",
      messages: [{ role: "user", content: "Say hello in one word." }],
      stream: false,
    }),
  });

  console.log("\nBeta endpoint - Status:", res3.status);
  const body3 = await res3.text();
  console.log("Body:", body3);
}

main().catch(console.error);
