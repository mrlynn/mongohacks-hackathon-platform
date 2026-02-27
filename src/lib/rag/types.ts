import { Types } from "mongoose";

// --- RagDocument ---

export interface RagDocumentSource {
  filePath: string;
  title: string;
  section: string;
  category: string;
  url: string;
  type: "docs" | "event" | "project" | "platform";
}

export interface RagDocumentChunk {
  index: number;
  totalChunks: number;
  tokens: number;
}

export interface RagDocumentIngestion {
  runId: string;
  ingestedAt: Date;
  ingestedBy: Types.ObjectId;
  version: number;
}

export interface IRagDocument {
  _id: Types.ObjectId;
  content: string;
  contentHash: string;
  accessLevel: "public" | "authenticated";
  source: RagDocumentSource;
  chunk: RagDocumentChunk;
  embedding: number[];
  ingestion: RagDocumentIngestion;
  createdAt: Date;
  updatedAt: Date;
}

// --- RagIngestionRun ---

export interface IngestionRunStats {
  filesProcessed: number;
  filesSkipped: number;
  chunksCreated: number;
  chunksDeleted: number;
  embeddingsGenerated: number;
  totalTokens: number;
  errors: Array<{ file: string; error: string }>;
}

export type IngestionRunStatus =
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export interface IRagIngestionRun {
  _id: Types.ObjectId;
  runId: string;
  status: IngestionRunStatus;
  stats: IngestionRunStats;
  startedAt: Date;
  completedAt: Date | null;
  durationMs: number | null;
  triggeredBy: Types.ObjectId;
  createdAt: Date;
}

// --- RagConversation ---

export interface ChatMessageSource {
  title: string;
  url: string;
  section: string;
  relevanceScore: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: ChatMessageSource[];
  feedback?: "up" | "down";
  createdAt: Date;
}

export interface IRagConversation {
  _id: Types.ObjectId;
  sessionId: string;
  userId?: Types.ObjectId;
  messages: ChatMessage[];
  metadata: {
    page: string;
    userAgent: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// --- Chunking ---

export interface ChunkingConfig {
  maxChunkTokens: number;
  overlapTokens: number;
  minChunkTokens: number;
}

export interface ParsedDocument {
  filePath: string;
  title: string;
  category: string;
  url: string;
  frontmatter: Record<string, unknown>;
  sections: ParsedSection[];
  rawContent: string;
}

export interface ParsedSection {
  heading: string;
  level: number;
  content: string;
}

export interface DocumentChunk {
  content: string;
  section: string;
  index: number;
  tokens: number;
}

// --- Embedding ---

export type VoyageInputType = "document" | "query";

export interface EmbeddingResult {
  embeddings: number[][];
  totalTokens: number;
}

// --- Ingestion ---

export interface IngestionOptions {
  forceReindex?: boolean;
  docsPath?: string;
  triggeredBy: Types.ObjectId;
}

export interface FileChange {
  filePath: string;
  status: "new" | "changed" | "unchanged" | "deleted";
  contentHash: string;
  rawContent: string;
}
