"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Collapse,
  Card,
  CardContent,
  Grid,
  Button,
  Menu,
  MenuItem,
  Snackbar,
} from "@mui/material";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Send as SendIcon,
} from "@mui/icons-material";

interface FeedbackResponse {
  _id: string;
  formId: { _id: string; name: string; slug: string } | null;
  respondentEmail: string;
  respondentName: string;
  respondentType: "participant" | "partner";
  answers: Record<string, string | number | string[]>;
  submittedAt: string;
}

function ResponseRow({ response }: { response: FeedbackResponse }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>{response.respondentName}</TableCell>
        <TableCell>{response.respondentEmail}</TableCell>
        <TableCell>
          <Chip
            label={response.respondentType}
            size="small"
            color={
              response.respondentType === "participant"
                ? "primary"
                : "secondary"
            }
            variant="outlined"
          />
        </TableCell>
        <TableCell>
          {response.formId?.name || "Unknown Form"}
        </TableCell>
        <TableCell>
          {new Date(response.submittedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ py: 2, px: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, mb: 1 }}
              >
                Answers
              </Typography>
              <Grid container spacing={1}>
                {Object.entries(response.answers).map(([qId, answer]) => (
                  <Grid size={{ xs: 12, md: 6 }} key={qId}>
                    <Card variant="outlined" sx={{ mb: 1 }}>
                      <CardContent sx={{ py: 1, px: 2, "&:last-child": { pb: 1 } }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {qId}
                        </Typography>
                        <Typography variant="body2">
                          {Array.isArray(answer)
                            ? answer.join(", ")
                            : String(answer)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function FeedbackResponsesPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const [eventId, setEventId] = useState("");
  const [responses, setResponses] = useState<FeedbackResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Send feedback state
  const [sendAnchor, setSendAnchor] = useState<null | HTMLElement>(null);
  const [sending, setSending] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  useEffect(() => {
    params.then((p) => {
      setEventId(p.eventId);
      fetchResponses(p.eventId);
    });
  }, [params]);

  const fetchResponses = async (eid: string) => {
    try {
      const res = await fetch(
        `/api/admin/events/${eid}/feedback-responses`
      );
      const data = await res.json();
      if (data.success) {
        setResponses(data.responses);
      } else {
        setError(data.error || "Failed to load responses");
      }
    } catch {
      setError("Failed to load feedback responses");
    } finally {
      setLoading(false);
    }
  };

  const handleSendFeedback = async (
    audience: "participant" | "partner" | "both"
  ) => {
    setSendAnchor(null);
    setSending(true);
    try {
      const res = await fetch(
        `/api/admin/events/${eventId}/send-feedback`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audience }),
        }
      );
      const data = await res.json();
      if (data.success) {
        const parts: string[] = [];
        if (data.participantsSent > 0)
          parts.push(`${data.participantsSent} participant${data.participantsSent !== 1 ? "s" : ""}`);
        if (data.partnersSent > 0)
          parts.push(`${data.partnersSent} partner${data.partnersSent !== 1 ? "s" : ""}`);
        const msg =
          parts.length > 0
            ? `Sent feedback requests to ${parts.join(" and ")}`
            : "No feedback requests were sent (no forms assigned or no recipients found)";
        setSnackbar({ open: true, message: msg, severity: "success" });
      } else {
        setSnackbar({
          open: true,
          message: data.error || "Failed to send feedback requests",
          severity: "error",
        });
      }
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to send feedback requests",
        severity: "error",
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
            Feedback Responses
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {responses.length} response{responses.length !== 1 ? "s" : ""}{" "}
            collected
          </Typography>
        </Box>
        <Box>
          <Button
            variant="contained"
            startIcon={
              sending ? <CircularProgress size={18} color="inherit" /> : <SendIcon />
            }
            disabled={sending}
            onClick={(e) => setSendAnchor(e.currentTarget)}
          >
            Send Feedback Request
          </Button>
          <Menu
            anchorEl={sendAnchor}
            open={Boolean(sendAnchor)}
            onClose={() => setSendAnchor(null)}
          >
            <MenuItem onClick={() => handleSendFeedback("both")}>
              All (Participants & Partners)
            </MenuItem>
            <MenuItem onClick={() => handleSendFeedback("participant")}>
              Participants Only
            </MenuItem>
            <MenuItem onClick={() => handleSendFeedback("partner")}>
              Partners Only
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {responses.length === 0 ? (
        <Alert severity="info">
          No feedback responses have been submitted for this event yet.
        </Alert>
      ) : (
        <>
          {/* Summary Stats */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                    {responses.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Responses
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                    {responses.filter((r) => r.respondentType === "participant").length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Participants
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                    {responses.filter((r) => r.respondentType === "partner").length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Partners
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Responses Table */}
          <TableContainer component={Paper} elevation={2}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width={50} />
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Form</TableCell>
                  <TableCell>Submitted</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {responses.map((response) => (
                  <ResponseRow key={response._id} response={response} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        message={snackbar.message}
      />
    </Box>
  );
}
