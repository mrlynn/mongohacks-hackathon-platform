"use client";

import { Box, Paper } from "@mui/material";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface PromptPreviewProps {
  prompt: string;
}

export default function PromptPreview({ prompt }: PromptPreviewProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        backgroundColor: "#f5f5f5",
        border: "1px solid #e0e0e0",
        borderRadius: 2,
        maxHeight: 500,
        overflow: "auto",
        "& h1": { fontSize: "1.5rem", fontWeight: 600, mb: 2 },
        "& h2": { fontSize: "1.25rem", fontWeight: 600, mt: 3, mb: 1.5 },
        "& h3": { fontSize: "1.1rem", fontWeight: 600, mt: 2, mb: 1 },
        "& p": { mb: 1.5 },
        "& ul, & ol": { pl: 2.5, mb: 1.5 },
        "& li": { mb: 0.5 },
        "& strong": { fontWeight: 600 },
        "& code": {
          backgroundColor: "#e0e0e0",
          padding: "2px 6px",
          borderRadius: "4px",
          fontSize: "0.9em",
          fontFamily: "monospace",
        },
      }}
    >
      <ReactMarkdown
        components={{
          code({ className, children }) {
            const match = /language-(\w+)/.exec(className || "");
            return match ? (
              <SyntaxHighlighter
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                style={vscDarkPlus as any}
                language={match[1]}
                PreTag="div"
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code className={className}>
                {children}
              </code>
            );
          },
        }}
      >
        {prompt}
      </ReactMarkdown>
    </Paper>
  );
}
