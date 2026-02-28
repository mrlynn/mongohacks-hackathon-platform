"use client";

import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Stack,
} from "@mui/material";
import { Code as CodeIcon, AutoAwesome as AutoAwesomeIcon } from "@mui/icons-material";
import VariantSelector from "./VariantSelector";
import PromptPreview from "./PromptPreview";
import PromptActions from "./PromptActions";

type PromptVariant = "full-scaffold" | "backend-first" | "frontend-first";

interface BuilderPromptPanelProps {
  ideaId: string;
  eventId: string;
  ideaName: string;
}

interface PromptData {
  prompt: string;
  variant: PromptVariant;
  enhanced: boolean;
  tokenEstimate: number;
  metadata: {
    ideaId: string;
    ideaName: string;
    eventName: string;
    generatedAt: string;
  };
}

export default function BuilderPromptPanel({
  ideaId,
  eventId,
  ideaName,
}: BuilderPromptPanelProps) {
  const [variant, setVariant] = useState<PromptVariant>("full-scaffold");
  const [promptData, setPromptData] = useState<PromptData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError("");

    try {
      const response = await fetch(
        `/api/project-suggestions/${ideaId}/builder-prompt?variant=${variant}`
      );

      if (!response.ok) {
        throw new Error("Failed to generate prompt");
      }

      const { data } = await response.json();
      setPromptData(data);
    } catch (err: any) {
      setError(err.message || "Failed to generate builder prompt");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEnhance = async () => {
    setIsEnhancing(true);
    setError("");

    try {
      const response = await fetch(
        `/api/project-suggestions/${ideaId}/builder-prompt`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variant }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to enhance prompt");
      }

      const { data } = await response.json();
      setPromptData(data);
    } catch (err: any) {
      setError(err.message || "Failed to enhance builder prompt");
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <Card elevation={2} sx={{ mt: 3 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <CodeIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            AI Builder Prompt
          </Typography>
          <Chip
            label="Copy-Paste Ready"
            size="small"
            color="primary"
            variant="outlined"
            sx={{ ml: 1 }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Generate a comprehensive prompt you can paste into Claude, ChatGPT, or
          any coding assistant to start building immediately.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Variant Selector */}
        <VariantSelector value={variant} onChange={setVariant} />

        {/* Generate Button */}
        {!promptData && (
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={isGenerating ? <CircularProgress size={20} /> : <CodeIcon />}
            onClick={handleGenerate}
            disabled={isGenerating}
            sx={{ mt: 2 }}
          >
            {isGenerating ? "Generating..." : "Generate Builder Prompt"}
          </Button>
        )}

        {/* Prompt Preview & Actions */}
        {promptData && (
          <Box sx={{ mt: 3 }}>
            {promptData.enhanced && (
              <Chip
                icon={<AutoAwesomeIcon />}
                label="AI Enhanced"
                color="secondary"
                size="small"
                sx={{ mb: 2 }}
              />
            )}

            <PromptPreview prompt={promptData.prompt} />

            <PromptActions
              prompt={promptData.prompt}
              ideaId={ideaId}
              ideaName={ideaName}
              variant={variant}
              onEnhance={handleEnhance}
              isEnhancing={isEnhancing}
              isEnhanced={promptData.enhanced}
            />

            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                {promptData.tokenEstimate.toLocaleString()} tokens estimated
              </Typography>
              <Typography variant="caption" color="text.secondary">
                •
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Generated {new Date(promptData.metadata.generatedAt).toLocaleTimeString()}
              </Typography>
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
