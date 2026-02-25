"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from "@mui/material";
import Link from "next/link";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

export default function Navbar() {
  return (
    <AppBar position="sticky" elevation={1}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <EmojiEventsIcon sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            component={Link}
            href="/"
            sx={{
              flexGrow: 1,
              textDecoration: "none",
              color: "inherit",
              fontWeight: 700,
            }}
          >
            HackPlatform
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button color="inherit" component={Link} href="/events">
              Events
            </Button>
            <Button color="inherit" component={Link} href="/dashboard">
              Dashboard
            </Button>
            <Button color="inherit" component={Link} href="/login">
              Sign In
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
