const apiKey = process.env.LANGBASE_API_KEY!;

async function main() {
  // Get pipe details via the list endpoint
  const res = await fetch("https://api.langbase.com/v1/pipes/list", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  const body = await res.text();
  console.log("Status:", res.status);
  console.log("Body:", body.slice(0, 3000));
}

main().catch(console.error);
