"use client";

import { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useParams } from "next/navigation";
import TemplateEditor from "./TemplateEditor";

export default function TemplateEditPage() {
  const params = useParams();
  const id = params.id as string;
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTemplate() {
      try {
        const res = await fetch(`/api/admin/templates/${id}`);
        const data = await res.json();
        if (data.success) {
          setTemplate(data.template);
        } else {
          setError(data.error || "Template not found");
        }
      } catch {
        setError("Failed to load template");
      } finally {
        setLoading(false);
      }
    }
    loadTemplate();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 8, textAlign: "center" }}>
        <Typography color="error" variant="h6">{error}</Typography>
      </Box>
    );
  }

  return <TemplateEditor initialConfig={template} />;
}
