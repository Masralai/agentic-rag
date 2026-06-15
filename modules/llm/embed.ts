import { pipeline } from "@xenova/transformers";

let extractor: any = null;

async function getExtractor() {
  if (!extractor) {
    extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return extractor;
}

export async function embed(text: string): Promise<number[]> {
  if (!text.trim()) return [];
  const e = await getExtractor();
  const result = await e(text, { pooling: "mean", normalize: true });
  return Array.from(result.data);
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  const valid = texts.filter((t) => t.trim());
  if (valid.length === 0) return [];
  const e = await getExtractor();
  const result = await e(valid, { pooling: "mean", normalize: true });
  return result.tolist().map((row: Float32Array) => Array.from(row));
}
