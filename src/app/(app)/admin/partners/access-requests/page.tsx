"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  PersonAdd as PersonAddIcon,
  CheckCircle as ApproveIcon,
  Cancel as DenyIcon,
} from "@mui/icons-material";

interface AccessRequest {
  _id: string;
  userId: { _id: string; name: string; email: string };
  partnerId?: { _id: string; name: string };
  newPartnerDetails?: {
    companyName: string;
    description: string;
    website?: string;
    industry: string;
  };
  requestedEventIds: Array<{ _id: string; name: string }>;
  status: "pending" | "approved" | "denied";
  reviewedBy?: { name: string };
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
}

export default function AccessRequestsPage() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewDialog, setReviewDialog] = useState<{
    request: AccessRequest;
    action: "approved" | "denied";
  } | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch("/api/partners/access-requests");
      const data = await res.json();
      setRequests(data.requests || []);
    } catch {
      setError("Failed to load access requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleReview = async () => {
    if (!reviewDialog) return;
    setProcessing(true);
    setError("");

    try {
      const res = await fetch(
        `/api/partners/access-requests/${reviewDialog.request._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: reviewDialog.action,
            reviewNotes,
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to process request");
      }

      setReviewDialog(null);
      setReviewNotes("");
      fetchRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process request");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const reviewedRequests = requests.filter((r) => r.status !== "pending");

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <PersonAddIcon color="primary" />
        <Typography variant="h5" fontWeight={700}>
          Partner Access Requests
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      {/* Pending */}
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        Pending ({pendingRequests.length})
      </Typography>
      {pendingRequests.length === 0 ? (
        <Card variant="outlined" sx={{ mb: 4 }}>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <Typography color="text.secondary">No pending requests</Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Card} variant="outlined" sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Contact</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Industry</TableCell>
                <TableCell>Events Requested</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingRequests.map((req) => (
                <TableRow key={req._id}>
                  <TableCell>
                    <Typography fontWeight={500}>{req.userId.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {req.userId.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {req.newPartnerDetails?.companyName || req.partnerId?.name || "--"}
                  </TableCell>
                  <TableCell>{req.newPartnerDetails?.industry || "--"}</TableCell>
                  <TableCell>
                    {req.requestedEventIds.length > 0
                      ? req.requestedEventIds.map((e) => e.name).join(", ")
                      : "None specified"}
                  </TableCell>
                  <TableCell>
                    {new Date(req.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      color="success"
                      startIcon={<ApproveIcon />}
                      onClick={() => setReviewDialog({ request: req, action: "approved" })}
                      sx={{ mr: 1 }}
                    >
                      Approve
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DenyIcon />}
                      onClick={() => setReviewDialog({ request: req, action: "denied" })}
                    >
                      Deny
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Reviewed */}
      {reviewedRequests.length > 0 && (
        <>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Reviewed ({reviewedRequests.length})
          </Typography>
          <TableContainer component={Card} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Contact</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Reviewed By</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reviewedRequests.map((req) => (
                  <TableRow key={req._id}>
                    <TableCell>
                      <Typography fontWeight={500}>{req.userId.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {req.userId.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {req.newPartnerDetails?.companyName || req.partnerId?.name || "--"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={req.status}
                        size="small"
                        color={req.status === "approved" ? "success" : "error"}
                      />
                    </TableCell>
                    <TableCell>{req.reviewedBy?.name || "--"}</TableCell>
                    <TableCell>
                      {req.reviewedAt ? new Date(req.reviewedAt).toLocaleDateString() : "--"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Review Dialog */}
      <Dialog open={!!reviewDialog} onClose={() => setReviewDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {reviewDialog?.action === "approved" ? "Approve" : "Deny"} Partner Request
        </DialogTitle>
        <DialogContent>
          {reviewDialog && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Contact:</strong> {reviewDialog.request.userId.name} ({reviewDialog.request.userId.email})
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Company:</strong> {reviewDialog.request.newPartnerDetails?.companyName || reviewDialog.request.partnerId?.name || "--"}
              </Typography>
              <TextField
                label="Review Notes (optional)"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                multiline
                rows={3}
                fullWidth
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialog(null)}>Cancel</Button>
          <Button
            variant="contained"
            color={reviewDialog?.action === "approved" ? "success" : "error"}
            onClick={handleReview}
            disabled={processing}
          >
            {processing ? "Processing..." : reviewDialog?.action === "approved" ? "Approve" : "Deny"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
