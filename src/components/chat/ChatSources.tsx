"use client";

import { Box, Chip, Typography } from "@mui/material";
import { Article as ArticleIcon } from "@mui/icons-material";
import Link from "next/link";

interface Source {
  title: string;
  url: string;
  section: string;
  relevanceScore: number;
}

interface ChatSourcesProps {
  sources: Source[];
}

export default function ChatSources({ sources }: ChatSourcesProps) {
  if (sources.length === 0) return null;

  return (
    <Box sx={{ mt: 1 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mb: 0.5 }}
      >
        Sources
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
        {sources.map((source, i) => (
          <Chip
            key={i}
            component={Link}
            href={source.url}
            icon={<ArticleIcon />}
            label={`${source.title} - ${source.section}`}
            size="small"
            variant="outlined"
            clickable
            sx={{
              fontSize: "0.7rem",
              height: 24,
              "& .MuiChip-icon": { fontSize: 14 },
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
