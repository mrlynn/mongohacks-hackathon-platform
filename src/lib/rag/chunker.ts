import type {
  ChunkingConfig,
  ParsedDocument,
  ParsedSection,
  DocumentChunk,
} from "./types";

const DEFAULT_CONFIG: ChunkingConfig = {
  maxChunkTokens: 512,
  overlapTokens: 64,
  minChunkTokens: 50,
};

/**
 * Rough token count — ~4 chars per token is a reasonable approximation.
 * Avoids a tokenizer dependency for the chunking step.
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Parse a markdown file into structured sections.
 * Extracts frontmatter, title, and heading-delimited sections.
 */
export function parseMarkdown(
  rawContent: string,
  filePath: string
): ParsedDocument {
  const lines = rawContent.split("\n");
  let frontmatter: Record<string, unknown> = {};
  let contentStart = 0;

  // Extract frontmatter (---  ... ---)
  if (lines[0]?.trim() === "---") {
    const endIdx = lines.indexOf("---", 1);
    if (endIdx > 0) {
      const fmLines = lines.slice(1, endIdx);
      frontmatter = parseFrontmatterLines(fmLines);
      contentStart = endIdx + 1;
    }
  }

  const content = lines.slice(contentStart).join("\n").trim();
  const sections = splitIntoSections(content);

  // Derive title: frontmatter title > first H1 > filename
  const title =
    (frontmatter.title as string) ||
    (frontmatter.sidebar_label as string) ||
    extractFirstHeading(content) ||
    fileNameToTitle(filePath);

  // Derive category from file path (first directory)
  const parts = filePath.split("/");
  const category = parts.length > 1 ? parts[0] : "general";

  // Derive URL path from file path
  const url = filePathToUrl(filePath);

  return {
    filePath,
    title,
    category,
    url,
    frontmatter,
    sections,
    rawContent,
  };
}

/**
 * Chunk a parsed document into embedding-ready pieces.
 */
export function chunkDocument(
  doc: ParsedDocument,
  config: ChunkingConfig = DEFAULT_CONFIG
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];

  for (const section of doc.sections) {
    const sectionChunks = chunkSection(section, doc.title, config);
    chunks.push(...sectionChunks);
  }

  // If document has no sections (e.g., just body text), chunk the whole thing
  if (chunks.length === 0 && doc.rawContent.trim()) {
    const bodySection: ParsedSection = {
      heading: doc.title,
      level: 1,
      content: stripFrontmatter(doc.rawContent),
    };
    chunks.push(...chunkSection(bodySection, doc.title, config));
  }

  // Add overlap between consecutive chunks
  const withOverlap = addOverlap(chunks, config.overlapTokens);

  // Set totalChunks on each
  const total = withOverlap.length;
  return withOverlap.map((chunk, i) => ({
    ...chunk,
    index: i,
    tokens: estimateTokens(chunk.content),
  }));

  // Filter out tiny chunks — but re-number after since we set totalChunks
  // Actually, keep them as-is since they carry section context
}

// --- Internal helpers ---

function parseFrontmatterLines(
  lines: string[]
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const line of lines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      let value: unknown = line.slice(colonIdx + 1).trim();
      // Remove surrounding quotes
      if (
        typeof value === "string" &&
        value.startsWith('"') &&
        value.endsWith('"')
      ) {
        value = value.slice(1, -1);
      }
      // Parse numbers and booleans
      if (value === "true") value = true;
      else if (value === "false") value = false;
      else if (!isNaN(Number(value)) && value !== "") value = Number(value);
      result[key] = value;
    }
  }
  return result;
}

function splitIntoSections(content: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  const lines = content.split("\n");
  let currentHeading = "";
  let currentLevel = 0;
  let currentContent: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      // Save previous section
      if (currentContent.length > 0 || currentHeading) {
        const text = currentContent.join("\n").trim();
        if (text) {
          sections.push({
            heading: currentHeading || "Introduction",
            level: currentLevel || 1,
            content: text,
          });
        }
      }
      currentHeading = headingMatch[2];
      currentLevel = headingMatch[1].length;
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  // Push final section
  const text = currentContent.join("\n").trim();
  if (text) {
    sections.push({
      heading: currentHeading || "Introduction",
      level: currentLevel || 1,
      content: text,
    });
  }

  return sections;
}

function chunkSection(
  section: ParsedSection,
  docTitle: string,
  config: ChunkingConfig
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  const prefix = `${docTitle} > ${section.heading}\n\n`;
  const prefixTokens = estimateTokens(prefix);
  const availableTokens = config.maxChunkTokens - prefixTokens;

  const sectionTokens = estimateTokens(section.content);

  // If section fits in one chunk, return it directly
  if (sectionTokens <= availableTokens) {
    const content = prefix + section.content;
    if (estimateTokens(content) >= config.minChunkTokens) {
      chunks.push({
        content,
        section: section.heading,
        index: 0,
        tokens: estimateTokens(content),
      });
    }
    return chunks;
  }

  // Split on paragraph boundaries, preserving code blocks
  const paragraphs = splitPreservingCodeBlocks(section.content);
  let currentChunk = prefix;
  let currentTokens = prefixTokens;

  for (const para of paragraphs) {
    const paraTokens = estimateTokens(para);

    // If a single paragraph exceeds max, it becomes its own chunk (e.g., large code block)
    if (paraTokens > availableTokens) {
      // Flush current chunk first
      if (currentTokens > prefixTokens) {
        chunks.push({
          content: currentChunk.trim(),
          section: section.heading,
          index: chunks.length,
          tokens: estimateTokens(currentChunk),
        });
      }
      // Add oversized paragraph as its own chunk
      chunks.push({
        content: prefix + para,
        section: section.heading,
        index: chunks.length,
        tokens: prefixTokens + paraTokens,
      });
      currentChunk = prefix;
      currentTokens = prefixTokens;
      continue;
    }

    // If adding this paragraph would exceed max, flush and start new chunk
    if (currentTokens + paraTokens > config.maxChunkTokens) {
      if (currentTokens > prefixTokens) {
        chunks.push({
          content: currentChunk.trim(),
          section: section.heading,
          index: chunks.length,
          tokens: estimateTokens(currentChunk),
        });
      }
      currentChunk = prefix + para + "\n\n";
      currentTokens = prefixTokens + paraTokens;
    } else {
      currentChunk += para + "\n\n";
      currentTokens += paraTokens;
    }
  }

  // Flush remaining
  if (currentTokens > prefixTokens) {
    chunks.push({
      content: currentChunk.trim(),
      section: section.heading,
      index: chunks.length,
      tokens: estimateTokens(currentChunk),
    });
  }

  return chunks;
}

/**
 * Split text on double newlines but keep code blocks (```) intact.
 */
function splitPreservingCodeBlocks(text: string): string[] {
  const result: string[] = [];
  const lines = text.split("\n");
  let current: string[] = [];
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      current.push(line);
      // If closing a code block, the whole block is one paragraph
      if (!inCodeBlock) {
        result.push(current.join("\n"));
        current = [];
      }
      continue;
    }

    if (inCodeBlock) {
      current.push(line);
      continue;
    }

    // Empty line = paragraph break (outside code blocks)
    if (line.trim() === "" && current.length > 0) {
      result.push(current.join("\n"));
      current = [];
    } else if (line.trim() !== "") {
      current.push(line);
    }
  }

  if (current.length > 0) {
    result.push(current.join("\n"));
  }

  return result;
}

function addOverlap(
  chunks: DocumentChunk[],
  overlapTokens: number
): DocumentChunk[] {
  if (chunks.length <= 1 || overlapTokens <= 0) return chunks;

  const overlapChars = overlapTokens * 4; // Reverse the token estimate

  return chunks.map((chunk, i) => {
    if (i === 0) return chunk;

    const prevContent = chunks[i - 1].content;
    const overlapText = prevContent.slice(-overlapChars);

    // Only add overlap if chunks are from the same section
    if (chunk.section === chunks[i - 1].section) {
      return {
        ...chunk,
        content: `...${overlapText}\n\n${chunk.content}`,
        tokens: estimateTokens(`...${overlapText}\n\n${chunk.content}`),
      };
    }

    return chunk;
  });
}

function extractFirstHeading(content: string): string | null {
  const match = content.match(/^#{1,2}\s+(.+)$/m);
  return match ? match[1] : null;
}

function fileNameToTitle(filePath: string): string {
  const name = filePath.split("/").pop()?.replace(/\.mdx?$/, "") || "Untitled";
  return name
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function filePathToUrl(filePath: string): string {
  // Remove .md/.mdx extension, convert to URL path
  return "/" + filePath.replace(/\.mdx?$/, "").replace(/\/index$/, "");
}

function stripFrontmatter(content: string): string {
  const lines = content.split("\n");
  if (lines[0]?.trim() === "---") {
    const endIdx = lines.indexOf("---", 1);
    if (endIdx > 0) {
      return lines.slice(endIdx + 1).join("\n").trim();
    }
  }
  return content;
}
