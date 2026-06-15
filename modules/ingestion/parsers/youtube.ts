import type { SourceParser, ParsedContent, SourceInput } from "../types";
import { YoutubeTranscript } from "youtube-transcript";

export class YouTubeParser implements SourceParser {
  async parse(input: SourceInput): Promise<ParsedContent> {
    if (!input.url) throw new Error("YouTube parser requires a URL");

    const videoId = this.extractVideoId(input.url);
    if (!videoId) throw new Error("Could not extract video ID from URL");

    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    const text = transcript.map((t) => t.text).join(" ");

    return {
      text,
      metadata: { parser: "youtube", url: input.url, videoId },
    };
  }

  private extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
      /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }
}
