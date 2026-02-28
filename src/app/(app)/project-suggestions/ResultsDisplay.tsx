'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Rating,
  Divider,
  Collapse,
  Stack,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from '@mui/material';
import BuilderPromptPanel from '@/components/project-suggestions/BuilderPromptPanel';

export default function ResultsDisplay({ ideas }: { ideas: any[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [refineDialogOpen, setRefineDialogOpen] = useState(false);
  const [refinementText, setRefinementText] = useState('');

  if (!ideas || ideas.length === 0) {
    return <Typography>No ideas generated yet.</Typography>;
  }

  const currentIdea = ideas[selectedIndex];
  const currentIdeaContent = currentIdea?.idea;
  const currentIdeaId = currentIdea?._id;
  const isSaved = saved[currentIdeaId] || currentIdea?.saved;

  const handleSave = async () => {
    setLoading(true);
    try {
      const method = isSaved ? 'DELETE' : 'POST';
      const response = await fetch(`/api/project-suggestions/${currentIdeaId}/save`, {
        method,
      });

      if (!response.ok) {
        throw new Error('Failed to save idea');
      }

      setSaved({ ...saved, [currentIdeaId]: !isSaved });
      setSnackbar({
        open: true,
        message: isSaved ? 'Idea removed from saved' : 'Idea saved successfully!',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to save idea',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/project-suggestions/${currentIdeaId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: [],
          message: '',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to share idea');
      }

      const data = await response.json();
      setShareLink(data.shareLink);
      setShareDialogOpen(true);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to generate share link',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefine = async () => {
    if (!refinementText.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a refinement instruction',
        severity: 'error',
      });
      return;
    }

    setLoading(true);
    setRefineDialogOpen(false);

    try {
      const response = await fetch(`/api/project-suggestions/${currentIdeaId}/refine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refinement: refinementText }),
      });

      if (!response.ok) {
        throw new Error('Failed to refine idea');
      }

      const data = await response.json();
      setSnackbar({
        open: true,
        message: 'Refined idea generated! Reloading...',
        severity: 'success',
      });

      // Reload page to show refined idea
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to refine idea',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    setSnackbar({
      open: true,
      message: 'Share link copied to clipboard!',
      severity: 'success',
    });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        🎉 Generated {ideas.length} Project Ideas!
      </Typography>

      {/* Idea selector */}
      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        {ideas.map((_, index) => (
          <Chip
            key={index}
            label={`Idea ${index + 1}`}
            onClick={() => setSelectedIndex(index)}
            color={selectedIndex === index ? 'primary' : 'default'}
            variant={selectedIndex === index ? 'filled' : 'outlined'}
          />
        ))}
      </Stack>

      {/* Idea card */}
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            🚀 {currentIdeaContent?.name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
            "{currentIdeaContent?.tagline}"
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            📋 Overview
          </Typography>
          <Typography variant="body1" paragraph>
            {currentIdeaContent?.problemStatement}
          </Typography>
          <Typography variant="body1" paragraph>
            {currentIdeaContent?.solution}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            🛠 Tech Stack
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Frontend:</Typography>
            {currentIdeaContent?.techStack?.frontend?.map((tech: string) => (
              <Chip key={tech} label={tech} size="small" sx={{ mr: 1, mb: 1 }} />
            ))}
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Backend:</Typography>
            {currentIdeaContent?.techStack?.backend?.map((tech: string) => (
              <Chip key={tech} label={tech} size="small" sx={{ mr: 1, mb: 1 }} />
            ))}
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2">APIs & Services:</Typography>
            {currentIdeaContent?.techStack?.apis?.map((api: string) => (
              <Chip key={api} label={api} size="small" sx={{ mr: 1, mb: 1 }} color="primary" />
            ))}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            ⏱ Timeline ({currentIdeaContent?.timeline?.[currentIdeaContent.timeline.length - 1]?.hours || '24'} hours)
          </Typography>
          {currentIdeaContent?.timeline?.map((phase: any, index: number) => (
            <Box key={index} sx={{ mb: 1 }}>
              <Typography variant="subtitle2">
                {phase.phase} (Hours {phase.hours})
              </Typography>
              <ul style={{ marginTop: 4 }}>
                {phase.tasks?.map((task: string, i: number) => (
                  <li key={i}><Typography variant="body2">{task}</Typography></li>
                ))}
              </ul>
            </Box>
          ))}

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="h6">📊 Difficulty:</Typography>
            <Rating value={currentIdeaContent?.difficulty || 3} readOnly max={5} />
            <Typography variant="body2" color="text.secondary">
              {currentIdeaContent?.difficulty === 1 ? 'Beginner' :
               currentIdeaContent?.difficulty === 2 ? 'Easy' :
               currentIdeaContent?.difficulty === 3 ? 'Moderate' :
               currentIdeaContent?.difficulty === 4 ? 'Challenging' : 'Very Challenging'}
            </Typography>
          </Box>

          <Typography variant="h6" gutterBottom>
            🎯 Prize Categories
          </Typography>
          {currentIdeaContent?.prizeCategories?.map((prize: string) => (
            <Chip key={prize} label={`✓ ${prize}`} color="success" sx={{ mr: 1, mb: 1 }} />
          ))}

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 2, mt: 3, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : null}
            >
              {isSaved ? '✓ Saved' : '💾 Save'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => setRefineDialogOpen(true)}
              disabled={loading}
            >
              🔄 Refine
            </Button>
            <Button
              variant="outlined"
              onClick={handleShare}
              disabled={loading}
            >
              📤 Share
            </Button>
            <Button variant="outlined" onClick={() => setExpanded(!expanded)}>
              {expanded ? '👀 Hide Details' : '👀 Show Details'}
            </Button>
          </Box>

          {/* Expandable implementation guide */}
          <Collapse in={expanded}>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>
              📖 Implementation Guide
            </Typography>
            <Box sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.9rem' }}>
              {currentIdeaContent?.implementationGuide || 'No implementation guide available.'}
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      {/* AI Builder Prompt - generate copy-paste ready prompt for Claude/ChatGPT */}
      {currentIdeaId && currentIdea?.eventId && (
        <BuilderPromptPanel
          ideaId={currentIdeaId}
          eventId={currentIdea.eventId.toString()}
          ideaName={currentIdeaContent?.name || 'Project'}
        />
      )}

      <Button variant="text" href="/project-suggestions" sx={{ mt: 3 }}>
        ← Generate More Ideas
      </Button>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Share Project Idea</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Copy this link to share with your team:
          </Typography>
          <TextField
            fullWidth
            value={shareLink}
            InputProps={{ readOnly: true }}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
          <Button variant="contained" onClick={copyShareLink}>
            Copy Link
          </Button>
        </DialogActions>
      </Dialog>

      {/* Refine Dialog */}
      <Dialog open={refineDialogOpen} onClose={() => setRefineDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Refine Project Idea</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Tell us how you'd like to adjust this idea:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={refinementText}
            onChange={(e) => setRefinementText(e.target.value)}
            placeholder="e.g., Make it simpler, Add more AI features, Use different tech stack"
            sx={{ mb: 2 }}
          />
          <Typography variant="caption" color="text.secondary">
            Common refinements: "make it simpler", "add more AI", "change tech stack", "make it more ambitious"
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRefineDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleRefine} disabled={!refinementText.trim()}>
            Generate Refined Idea
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
