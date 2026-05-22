import type { SourceParser, ParsedContent, SourceInput } from "../types";
import * as cheerio from "cheerio";

export class WebParser implements SourceParser {
  async parse(input: SourceInput): Promise<ParsedContent> {
    if (!input.url) throw new Error("Web parser requires a URL");

    const res = await fetch(input.url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AgenticRAG/1.0)" },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch URL: ${res.status} ${res.statusText}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // Remove script, style, nav, footer tags
    $("script, style, nav, footer, header, noscript").remove();

    const title = $("title").text().trim();
    const body = $("body").text().replace(/\s+/g, " ").trim();

    return {
      text: body,
      metadata: { parser: "web", url: input.url, title },
    };
  }
}
