"use client";

import { Box, Typography } from "@mui/material";

export default function LandingPageFooter() {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        textAlign: "center",
        borderTop: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", fontSize: "0.8rem" }}
      >
        Powered by{" "}
        <Box
          component="a"
          href="/"
          sx={{
            color: "primary.main",
            textDecoration: "none",
            fontWeight: 600,
            "&:hover": { textDecoration: "underline" },
          }}
        >
          MongoDB Hackathons
        </Box>
      </Typography>
    </Box>
  );
}
