const LM_STUDIO_BASE = process.env.LM_STUDIO_URL || "http://localhost:1234";

export async function isLMStudioAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${LM_STUDIO_BASE}/v1/models`, {
      signal: AbortSignal.timeout(2000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function generate(
  messages: { role: string; content: string }[],
): Promise<string> {
  const res = await fetch(`${LM_STUDIO_BASE}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, stream: false }),
  });
  if (!res.ok) throw new Error(`LM Studio: ${res.status} ${await res.text()}`);
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
        const res = await fetch(`${LM_STUDIO_BASE}/v1/chat/completions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages, stream: true }),
        });
        if (!res.ok) throw new Error(`LM Studio: ${res.status} ${await res.text()}`);
        if (!res.body) throw new Error("LM Studio: no response body");

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
            encoder.encode(JSON.stringify({ type: "error", message: "LM Studio stream failed" })),
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
