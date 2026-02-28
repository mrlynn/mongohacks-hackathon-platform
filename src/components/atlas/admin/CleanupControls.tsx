'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Stack,
  CircularProgress,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  DeleteSweep as DeleteSweepIcon,
  Preview as PreviewIcon,
} from '@mui/icons-material';

interface CleanupReport {
  eventId: string;
  eventName: string;
  clustersFound: number;
  clustersDeleted: number;
  errors: Array<{ clusterId: string; error: string }>;
}

export default function CleanupControls() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [eventsToCleanup, setEventsToCleanup] = useState<string[]>([]);
  const [cleanupResults, setCleanupResults] = useState<{
    eventsProcessed: number;
    totals: { clustersFound: number; clustersDeleted: number; errors: number };
    reports: CleanupReport[];
  } | null>(null);

  const handlePreview = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/atlas/admin/cleanup');
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to preview cleanup');

      setEventsToCleanup(data.eventIds);
      setPreviewDialogOpen(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleRunCleanup = async () => {
    if (!confirm('Run cleanup for all concluded events? This will delete clusters and cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/atlas/admin/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dryRun: false }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to run cleanup');

      setCleanupResults(data);
      setResultDialogOpen(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Event Cleanup
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Automatically delete Atlas clusters when events conclude. Only affects events with auto-cleanup enabled.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={loading ? <CircularProgress size={20} /> : <PreviewIcon />}
              onClick={handlePreview}
              disabled={loading}
            >
              Preview Cleanup
            </Button>
            <Button
              variant="contained"
              color="warning"
              startIcon={loading ? <CircularProgress size={20} /> : <DeleteSweepIcon />}
              onClick={handleRunCleanup}
              disabled={loading}
            >
              Run Cleanup Now
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cleanup Preview</DialogTitle>
        <DialogContent>
          {eventsToCleanup.length === 0 ? (
            <Alert severity="success">
              No events need cleanup. All concluded events have been cleaned up!
            </Alert>
          ) : (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                {eventsToCleanup.length} concluded event(s) have active clusters that will be deleted.
              </Alert>
              <Typography variant="subtitle2" gutterBottom>
                Events needing cleanup:
              </Typography>
              <List dense>
                {eventsToCleanup.map((eventId) => (
                  <ListItem key={eventId}>
                    <ListItemText
                      primary={eventId}
                      primaryTypographyProps={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Results Dialog */}
      <Dialog
        open={resultDialogOpen}
        onClose={() => setResultDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Cleanup Complete</DialogTitle>
        <DialogContent>
          {cleanupResults && (
            <Stack spacing={2}>
              <Alert severity={cleanupResults.totals.errors > 0 ? 'warning' : 'success'}>
                Processed {cleanupResults.eventsProcessed} event(s): {cleanupResults.totals.clustersDeleted} of {cleanupResults.totals.clustersFound} clusters deleted
                {cleanupResults.totals.errors > 0 && ` (${cleanupResults.totals.errors} errors)`}
              </Alert>

              {cleanupResults.reports.map((report) => (
                <Box key={report.eventId}>
                  <Typography variant="subtitle2">{report.eventName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {report.clustersDeleted}/{report.clustersFound} clusters deleted
                  </Typography>
                  {report.errors.length > 0 && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      {report.errors.length} error(s):
                      <List dense>
                        {report.errors.map((err, idx) => (
                          <ListItem key={idx}>
                            <ListItemText
                              primary={err.clusterId}
                              secondary={err.error}
                              primaryTypographyProps={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Alert>
                  )}
                </Box>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResultDialogOpen(false)} variant="contained">
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
