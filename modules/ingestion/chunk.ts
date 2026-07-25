const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

// ponytail: paragraph-first split, hard-cut only when a paragraph exceeds CHUNK_SIZE
export function chunkText(text: string): string[] {
  if (!text) return [];

  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length === 0) return hardChunk(text);

  const chunks: string[] = [];
  let buf = "";

  for (const para of paragraphs) {
    if (para.length > CHUNK_SIZE) {
      if (buf) {
        chunks.push(buf);
        buf = "";
      }
      chunks.push(...hardChunk(para));
      continue;
    }
    const next = buf ? `${buf}\n\n${para}` : para;
    if (next.length <= CHUNK_SIZE) {
      buf = next;
    } else {
      chunks.push(buf);
      const overlap = buf.slice(-CHUNK_OVERLAP);
      buf = overlap ? `${overlap}\n\n${para}` : para;
      if (buf.length > CHUNK_SIZE) {
        chunks.push(...hardChunk(buf));
        buf = "";
      }
    }
  }
  if (buf) chunks.push(buf);
  return chunks;
}

function hardChunk(text: string): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, Math.min(i + CHUNK_SIZE, text.length)));
    i += CHUNK_SIZE - CHUNK_OVERLAP;
    if (i >= text.length) break;
  }
  return chunks;
}
