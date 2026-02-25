"use client";

import { Button } from "@mui/material";
import { Download as DownloadIcon } from "@mui/icons-material";
import { exportToCSV } from "@/lib/utils/csv";

interface ExportButtonProps<T> {
  data: T[];
  filename: string;
  columns?: { key: keyof T; label: string }[];
  disabled?: boolean;
  variant?: "text" | "outlined" | "contained";
}

export default function ExportButton<T extends Record<string, any>>({
  data,
  filename,
  columns,
  disabled = false,
  variant = "outlined",
}: ExportButtonProps<T>) {
  const handleExport = () => {
    exportToCSV(data, filename, columns);
  };

  return (
    <Button
      variant={variant}
      startIcon={<DownloadIcon />}
      onClick={handleExport}
      disabled={disabled || data.length === 0}
    >
      Export CSV
    </Button>
  );
}
