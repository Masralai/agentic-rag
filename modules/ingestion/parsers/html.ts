import type { SourceParser, ParsedContent, SourceInput } from "../types";
import * as cheerio from "cheerio";

export class HtmlParser implements SourceParser {
  async parse(input: SourceInput): Promise<ParsedContent> {
    if (!input.file) throw new Error("HTML parser requires a file buffer");
    const raw = input.file.toString("utf-8");
    const $ = cheerio.load(raw);

    $("script, style, noscript, iframe, svg, nav, footer, header").remove();
    const text = $("body").text().replace(/\s+/g, " ").trim();
    const title = $("title").text().trim();

    return {
      text: text || raw,
      metadata: {
        parser: "html",
        fileName: input.fileName,
        title: title || undefined,
      },
    };
  }
}
