'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Rating,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useRouter } from 'next/navigation';

export default function SavedIdeasView({ userId }: { userId: string }) {
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchSavedIdeas();
  }, []);

  const fetchSavedIdeas = async () => {
    try {
      const response = await fetch('/api/project-suggestions/saved');
      
      if (!response.ok) {
        throw new Error('Failed to fetch saved ideas');
      }

      const data = await response.json();
      setIdeas(data.ideas || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (ideaId: string) => {
    try {
      const response = await fetch(`/api/project-suggestions/${ideaId}/save`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to unsave idea');
      }

      // Remove from local state
      setIdeas(ideas.filter((idea) => idea._id !== ideaId));
    } catch (err) {
      console.error('Failed to unsave:', err);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading saved ideas...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          💾 Saved Project Ideas
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {ideas.length} saved {ideas.length === 1 ? 'idea' : 'ideas'}
        </Typography>
      </Box>

      {ideas.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No saved ideas yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Generate some project ideas and save your favorites!
          </Typography>
          <Button variant="contained" href="/project-suggestions">
            Generate Ideas
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {ideas.map((savedIdea) => (
            <Grid item xs={12} md={6} key={savedIdea._id}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    {savedIdea.idea.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    "{savedIdea.idea.tagline}"
                  </Typography>

                  <Typography variant="body2" paragraph>
                    {savedIdea.idea.problemStatement.substring(0, 150)}...
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Difficulty:
                    </Typography>
                    <Rating value={savedIdea.idea.difficulty} readOnly size="small" />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                      Tech Stack:
                    </Typography>
                    {savedIdea.idea.techStack.apis.slice(0, 3).map((api: string) => (
                      <Chip key={api} label={api} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                    ))}
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    Saved: {new Date(savedIdea.generatedAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" href={`/project-suggestions/${savedIdea._id}`}>
                    View Full Details
                  </Button>
                  <Button size="small" color="error" onClick={() => handleUnsave(savedIdea._id)}>
                    Remove
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
