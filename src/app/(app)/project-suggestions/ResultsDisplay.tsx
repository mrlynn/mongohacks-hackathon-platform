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
} from '@mui/material';

export default function ResultsDisplay({ ideas }: { ideas: any[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);

  if (!ideas || ideas.length === 0) {
    return <Typography>No ideas generated yet.</Typography>;
  }

  const currentIdea = ideas[selectedIndex]?.idea;

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
            🚀 {currentIdea?.name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
            "{currentIdea?.tagline}"
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            📋 Overview
          </Typography>
          <Typography variant="body1" paragraph>
            {currentIdea?.problemStatement}
          </Typography>
          <Typography variant="body1" paragraph>
            {currentIdea?.solution}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            🛠 Tech Stack
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Frontend:</Typography>
            {currentIdea?.techStack?.frontend?.map((tech: string) => (
              <Chip key={tech} label={tech} size="small" sx={{ mr: 1, mb: 1 }} />
            ))}
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Backend:</Typography>
            {currentIdea?.techStack?.backend?.map((tech: string) => (
              <Chip key={tech} label={tech} size="small" sx={{ mr: 1, mb: 1 }} />
            ))}
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2">APIs & Services:</Typography>
            {currentIdea?.techStack?.apis?.map((api: string) => (
              <Chip key={api} label={api} size="small" sx={{ mr: 1, mb: 1 }} color="primary" />
            ))}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            ⏱ Timeline ({currentIdea?.timeline?.[currentIdea.timeline.length - 1]?.hours || '24'} hours)
          </Typography>
          {currentIdea?.timeline?.map((phase: any, index: number) => (
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
            <Rating value={currentIdea?.difficulty || 3} readOnly max={5} />
            <Typography variant="body2" color="text.secondary">
              {currentIdea?.difficulty === 1 ? 'Beginner' :
               currentIdea?.difficulty === 2 ? 'Easy' :
               currentIdea?.difficulty === 3 ? 'Moderate' :
               currentIdea?.difficulty === 4 ? 'Challenging' : 'Very Challenging'}
            </Typography>
          </Box>

          <Typography variant="h6" gutterBottom>
            🎯 Prize Categories
          </Typography>
          {currentIdea?.prizeCategories?.map((prize: string) => (
            <Chip key={prize} label={`✓ ${prize}`} color="success" sx={{ mr: 1, mb: 1 }} />
          ))}

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button variant="contained">💾 Save</Button>
            <Button variant="outlined">🔄 Refine</Button>
            <Button variant="outlined">📤 Share</Button>
            <Button variant="outlined" onClick={() => setExpanded(!expanded)}>
              {expanded ? '👀 Hide' : '👀 Details'}
            </Button>
          </Box>

          {/* Expandable implementation guide */}
          <Collapse in={expanded}>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>
              📖 Implementation Guide
            </Typography>
            <Box sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.9rem' }}>
              {currentIdea?.implementationGuide || 'No implementation guide available.'}
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      <Button variant="text" href="/project-suggestions" sx={{ mt: 3 }}>
        ← Generate More Ideas
      </Button>
    </Box>
  );
}
