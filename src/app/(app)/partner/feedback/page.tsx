"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  Feedback as FeedbackIcon,
  CheckCircle as SubmittedIcon,
  RateReview as ReviewIcon,
} from "@mui/icons-material";
import Link from "next/link";

interface FeedbackEvent {
  _id: string;
  name: string;
  status: string;
  startDate: string;
  feedbackForm: {
    _id: string;
    title: string;
    description: string;
  } | null;
  hasSubmitted: boolean;
}

export default function PartnerFeedbackPage() {
  const [events, setEvents] = useState<FeedbackEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFeedback = useCallback(async () => {
    try {
      const res = await fetch("/api/partner/feedback");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load feedback forms");
      setEvents(data.feedbackEvents || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load feedback forms");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <FeedbackIcon color="primary" />
        <Typography variant="h5" fontWeight={700}>
          Event Feedback
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Share your feedback on events you have participated in as a partner.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {events.length === 0 ? (
        <Card variant="outlined">
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <FeedbackIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
            <Typography color="text.secondary">
              No feedback forms available yet. Feedback forms will appear here when event organizers create them.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Card} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Event</TableCell>
                <TableCell>Feedback Form</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event._id}>
                  <TableCell>
                    <Typography fontWeight={500}>{event.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {event.startDate
                        ? new Date(event.startDate).toLocaleDateString()
                        : ""}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {event.feedbackForm ? (
                      <Typography variant="body2">{event.feedbackForm.title}</Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Not available
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {event.hasSubmitted ? (
                      <Chip
                        icon={<SubmittedIcon />}
                        label="Submitted"
                        size="small"
                        color="success"
                      />
                    ) : (
                      <Chip label="Pending" size="small" color="warning" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {event.feedbackForm && !event.hasSubmitted && (
                      <Link href={`/feedback/${event.feedbackForm._id}?eventId=${event._id}`}>
                        <Button size="small" startIcon={<ReviewIcon />}>
                          Submit Feedback
                        </Button>
                      </Link>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
