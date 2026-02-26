// Mock OpenAI module
jest.mock('openai', () => {
  const mockCreate = jest.fn().mockResolvedValue({
    choices: [{
      message: {
        content: 'This project builds a retrieval-augmented generation (RAG) chatbot using MongoDB Atlas Vector Search and OpenAI GPT-4 to answer questions about MongoDB documentation. The system embeds documentation chunks and retrieves relevant context before generating responses. Built with Python, LangChain, and a Next.js frontend.'
      }
    }],
    usage: {
      prompt_tokens: 300,
      completion_tokens: 100,
      total_tokens: 400
    }
  });
  
  return jest.fn().mockImplementation(() => {
    return {
      chat: {
        completions: {
          create: mockCreate
        }
      }
    };
  });
});

import { setupTestDB, teardownTestDB } from "../utils/db";
import { generateProjectSummary } from "@/lib/ai/summary-service";

describe("AI Summary Service", () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  describe("generateProjectSummary", () => {
    it("should generate summary with all project fields", async () => {
      // Project data
      const projectData = {
        name: "RAG Chatbot for MongoDB Docs",
        description: "A retrieval-augmented generation chatbot that answers questions about MongoDB documentation using Atlas Vector Search and GPT-4.",
        technologies: ["MongoDB", "OpenAI", "Python", "LangChain", "Next.js"],
        innovations: "Uses MongoDB Atlas Vector Search for semantic document retrieval instead of traditional keyword search.",
      };

      // Generate summary
      const summary = await generateProjectSummary(projectData);

      // Verify summary was generated
      expect(summary).toBeDefined();
      expect(typeof summary).toBe('string');
      expect(summary.length).toBeGreaterThan(50);
      expect(summary.length).toBeLessThan(500);
      
      // Should mention key technologies
      expect(summary.toLowerCase()).toMatch(/mongodb|vector|rag|chatbot/);
    });

    it("should handle missing optional fields gracefully", async () => {
      // Project with minimal data (no innovations)
      const projectData = {
        name: "Simple Web App",
        description: "A basic web application for managing tasks",
        technologies: ["React"],
      };

      const summary = await generateProjectSummary(projectData);

      expect(summary).toBeDefined();
      expect(summary.length).toBeGreaterThan(0);
      expect(summary).not.toContain('undefined');
      expect(summary).not.toContain('null');
    });

    it("should handle empty technologies array", async () => {
      const projectData = {
        name: "Minimal Project",
        description: "Very basic project for testing",
        technologies: [],
      };

      const summary = await generateProjectSummary(projectData);
      
      expect(summary).toBeDefined();
      expect(summary.length).toBeGreaterThan(0);
    });
  });

  describe("Summary Quality Validation", () => {
    it("generated summary should be appropriate length", async () => {
      const projectData = {
        name: "Quality Test Project",
        description: "A well-documented project for quality testing",
        technologies: ["MongoDB", "Python", "FastAPI"],
        innovations: "Novel approach to data modeling",
      };

      const summary = await generateProjectSummary(projectData);

      // Quality checks
      expect(summary.length).toBeGreaterThanOrEqual(50);
      expect(summary.length).toBeLessThanOrEqual(500);

      // Should have multiple sentences
      const sentences = summary.split(/[.!?]+/).filter(s => s.trim().length > 0);
      expect(sentences.length).toBeGreaterThanOrEqual(2);
    });

    it("should not contain marketing buzzwords", async () => {
      const projectData = {
        name: "Professional Project",
        description: "A well-architected application",
        technologies: ["React", "MongoDB"],
      };

      const summary = await generateProjectSummary(projectData);

      // Mocked response should not contain marketing language
      const marketingPhrases = [
        'revolutionary',
        'game-changing',
        'cutting-edge',
        'amazing'
      ];

      const lowerSummary = summary.toLowerCase();
      for (const phrase of marketingPhrases) {
        expect(lowerSummary).not.toContain(phrase);
      }
    });

    it("should mention technologies", async () => {
      const projectData = {
        name: "Tech Stack Project",
        description: "A project showcasing technologies",
        technologies: ["MongoDB", "Express", "React", "Node.js"],
        innovations: "Modern MERN stack",
      };

      const summary = await generateProjectSummary(projectData);

      // Mocked response mentions MongoDB
      expect(summary.toLowerCase()).toMatch(/mongodb/);
    });
  });
});
