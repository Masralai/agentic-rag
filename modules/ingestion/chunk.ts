const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

export function chunkText(text: string): string[] {
  if (!text) return [];

  const chunks: string[] = [];
  let i = 0;

  while (i < text.length) {
    const end = Math.min(i + CHUNK_SIZE, text.length);
    chunks.push(text.slice(i, end));
    i += CHUNK_SIZE - CHUNK_OVERLAP;

    if (i >= text.length) break;
  }

  return chunks;
}
