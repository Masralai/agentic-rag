import { CONFIG } from "@/lib/config";

const BASE_URL = "https://openrouter.ai/api/v1";
const API_KEY = process.env.OPENROUTER_API_KEY;

export function isOpenRouterConfigured(): boolean {
  return !!API_KEY;
}

export async function generate(
  messages: { role: string; content: string }[],
): Promise<string> {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      messages,
      model: CONFIG.OPENROUTER_MODEL,
      stream: false,
      max_tokens: 4096,
    }),
  });
  if (!res.ok) throw new Error(`OpenRouter: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return json.choices?.[0]?.message?.content || "";
}

export function generateStream(
  messages: { role: string; content: string }[],
): ReadableStream {
  const encoder = new TextEncoder();
  let cancelled = false;

  return new ReadableStream({
    async start(controller) {
      try {
        const res = await fetch(`${BASE_URL}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
          body: JSON.stringify({
            messages,
            model: CONFIG.OPENROUTER_MODEL,
            stream: true,
            max_tokens: 4096,
          }),
        });
        if (!res.ok) throw new Error(`OpenRouter: ${res.status} ${await res.text()}`);
        if (!res.body) throw new Error("OpenRouter: no response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (!cancelled) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data: ")) continue;
            const payload = trimmed.slice(6);
            if (payload === "[DONE]") continue;
            try {
              const json = JSON.parse(payload);
              const text = json.choices?.[0]?.delta?.content || "";
              if (text) controller.enqueue(encoder.encode(text));
            } catch {}
          }
        }

        controller.close();
      } catch (error) {
        if (!cancelled) {
          controller.enqueue(
            encoder.encode(JSON.stringify({ type: "error", message: "OpenRouter stream failed" })),
          );
          controller.close();
        }
      }
    },
    cancel() {
      cancelled = true;
    },
  });
}
