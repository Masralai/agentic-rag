import { langbase, fromReadableStream } from "@/lib/langbase";
import { CONFIG } from "@/lib/config";
import { isLMStudioAvailable, generate as lmGenerate, generateStream as lmGenerateStream } from "./lmstudio";

let useLM = false;
let checked = false;

async function detect(): Promise<boolean> {
  if (!checked) {
    useLM = await isLMStudioAvailable();
    checked = true;
  }
  return useLM;
}

async function ensureDetected(): Promise<"lmstudio" | "langbase"> {
  return (await detect()) ? "lmstudio" : "langbase";
}

export async function generate(
  systemPrompt: string,
  userContent?: string,
): Promise<string> {
  const provider = await ensureDetected();

  if (provider === "lmstudio") {
    const messages = userContent
      ? [{ role: "system" as const, content: systemPrompt }, { role: "user" as const, content: userContent }]
      : [{ role: "system" as const, content: systemPrompt }];
    return lmGenerate(messages);
  }

  const messages: { role: "system" | "user"; content: string }[] = userContent
    ? [{ role: "system", content: systemPrompt }, { role: "user", content: userContent }]
    : [{ role: "system", content: systemPrompt }];

  const { completion } = await langbase.pipes.run({
    stream: false,
    name: CONFIG.PIPE_NAME,
    messages,
    ...(CONFIG.LLM_API_KEY ? { llmKey: CONFIG.LLM_API_KEY } : {}),
  });
  return completion || "";
}

export async function generateStream(
  systemPrompt: string,
  userContent: string,
): Promise<ReadableStream> {
  const provider = await ensureDetected();

  if (provider === "lmstudio") {
    return lmGenerateStream([
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ]);
  }

  const messages: { role: "system" | "user"; content: string }[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userContent },
  ];
  const response = await langbase.pipes.run({
    stream: true,
    name: CONFIG.PIPE_NAME,
    messages,
    ...(CONFIG.LLM_API_KEY ? { llmKey: CONFIG.LLM_API_KEY } : {}),
  });

  const runner = fromReadableStream(response.stream);
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of runner) {
          const text = chunk.choices?.[0]?.delta?.content ?? "";
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      } catch {
        controller.enqueue(
          encoder.encode(JSON.stringify({ type: "error", message: "Langbase stream failed" })),
        );
        controller.close();
      }
    },
  });
}
