"use client";

import { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  AutoAwesome as EnhanceIcon,
} from "@mui/icons-material";

type PromptVariant = "full-scaffold" | "backend-first" | "frontend-first";

interface PromptActionsProps {
  prompt: string;
  ideaId: string;
  ideaName: string;
  variant: PromptVariant;
  onEnhance: () => Promise<void>;
  isEnhancing: boolean;
  isEnhanced: boolean;
}

export default function PromptActions({
  prompt,
  ideaId,
  ideaName,
  variant,
  onEnhance,
  isEnhancing,
  isEnhanced,
}: PromptActionsProps) {
  const [showCopied, setShowCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setShowCopied(true);

    // Track analytics
    fetch(`/api/project-suggestions/${ideaId}/builder-prompt/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "copy", variant }),
    }).catch(() => {});
  };

  const handleDownload = () => {
    const filename = `${ideaName.toLowerCase().replace(/\s+/g, "-")}-builder-prompt.md`;
    const blob = new Blob([prompt], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    // Track analytics
    fetch(`/api/project-suggestions/${ideaId}/builder-prompt/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "download", variant }),
    }).catch(() => {});
  };

  return (
    <Box sx={{ display: "flex", gap: 1.5, mt: 2, flexWrap: "wrap" }}>
      <Button
        variant="contained"
        startIcon={<CopyIcon />}
        onClick={handleCopy}
        sx={{ flex: 1, minWidth: 140 }}
      >
        Copy to Clipboard
      </Button>

      <Button
        variant="outlined"
        startIcon={<DownloadIcon />}
        onClick={handleDownload}
        sx={{ flex: 1, minWidth: 140 }}
      >
        Download .md
      </Button>

      {!isEnhanced && (
        <Button
          variant="outlined"
          color="secondary"
          startIcon={
            isEnhancing ? <CircularProgress size={20} /> : <EnhanceIcon />
          }
          onClick={onEnhance}
          disabled={isEnhancing}
          sx={{ flex: 1, minWidth: 160 }}
        >
          {isEnhancing ? "Enhancing..." : "Enhance with AI"}
        </Button>
      )}

      <Snackbar
        open={showCopied}
        autoHideDuration={2000}
        onClose={() => setShowCopied(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowCopied(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Builder prompt copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
}
