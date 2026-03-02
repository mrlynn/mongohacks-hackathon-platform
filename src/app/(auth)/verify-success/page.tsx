"use client";

import { Suspense } from "react";
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Skeleton,
} from "@mui/material";
import { CheckCircle as CheckCircleIcon } from "@mui/icons-material";
import Link from "next/link";

export default function VerifySuccessPage() {
  return (
    <Suspense fallback={<Container maxWidth="sm" sx={{ py: 8 }}><Card elevation={3}><CardContent sx={{ textAlign: "center", py: 6, px: 4 }}><Skeleton variant="circular" width={80} height={80} sx={{ mx: "auto", mb: 3 }} /><Skeleton variant="text" width="60%" sx={{ mx: "auto", mb: 2 }} /><Skeleton variant="text" width="80%" sx={{ mx: "auto" }} /></CardContent></Card></Container>}>
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card elevation={3}>
          <CardContent sx={{ textAlign: "center", py: 6, px: 4 }}>
            <CheckCircleIcon
              sx={{ fontSize: 80, color: "success.main", mb: 3 }}
            />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              Email Verified!
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, lineHeight: 1.7 }}
            >
              Your email address has been successfully verified. You can now
              submit projects, create teams, and access all platform features.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
              <Button
                component={Link}
                href="/dashboard"
                variant="contained"
                size="large"
              >
                Go to Dashboard
              </Button>
              <Button
                component={Link}
                href="/events"
                variant="outlined"
                size="large"
              >
                Browse Events
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Suspense>
  );
}
