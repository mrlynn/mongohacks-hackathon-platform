"use client";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { hackathonTheme } from "@/styles/theme";

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={hackathonTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
