import { langbase, fromReadableStream } from "@/lib/langbase";
import { CONFIG } from "@/lib/config";
import { isLMStudioAvailable, generate as lmGenerate, generateStream as lmGenerateStream } from "./lmstudio";
import { isOpenRouterConfigured, generate as orGenerate, generateStream as orGenerateStream } from "./openrouter";

type Provider = "lmstudio" | "openrouter" | "langbase";

let provider: Provider | null = null;

async function detect(): Promise<Provider> {
  if (provider) return provider;
  if (await isLMStudioAvailable()) provider = "lmstudio";
  else if (isOpenRouterConfigured()) provider = "openrouter";
  else provider = "langbase";
  return provider;
}

function buildMessages(systemPrompt: string, userContent?: string) {
  return userContent
    ? [{ role: "system" as const, content: systemPrompt }, { role: "user" as const, content: userContent }]
    : [{ role: "system" as const, content: systemPrompt }];
}

export async function generate(
  systemPrompt: string,
  userContent?: string,
): Promise<string> {
  const p = await detect();
  const messages = buildMessages(systemPrompt, userContent);

  if (p === "lmstudio") return lmGenerate(messages);
  if (p === "openrouter") return orGenerate(messages);

  const { completion } = await langbase.pipes.run({
    stream: false,
    name: CONFIG.PIPE_NAME,
    messages,
  });
  return completion || "";
}

export async function generateStream(
  systemPrompt: string,
  userContent: string,
): Promise<ReadableStream> {
  const p = await detect();
  const messages = buildMessages(systemPrompt, userContent) as { role: "system" | "user"; content: string }[];

  if (p === "lmstudio") return lmGenerateStream(messages);
  if (p === "openrouter") return orGenerateStream(messages);

  const response = await langbase.pipes.run({
    stream: true,
    name: CONFIG.PIPE_NAME,
    messages,
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
