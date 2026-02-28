'use client';

import { Card, CardContent, Typography, Button, Box } from '@mui/material';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { useRouter } from 'next/navigation';

interface ProjectSuggestionsCTAProps {
  variant?: 'card' | 'inline' | 'banner';
  eventId?: string;
  title?: string;
  description?: string;
}

export default function ProjectSuggestionsCTA({
  variant = 'card',
  eventId,
  title = 'Need project ideas?',
  description = 'Let AI help you brainstorm creative hackathon projects tailored to your skills and interests.',
}: ProjectSuggestionsCTAProps) {
  const router = useRouter();

  const handleClick = () => {
    const url = eventId 
      ? `/project-suggestions?eventId=${eventId}` 
      : '/project-suggestions';
    router.push(url);
  };

  if (variant === 'inline') {
    return (
      <Button
        variant="outlined"
        startIcon={<LightbulbIcon />}
        onClick={handleClick}
        sx={{ mb: 2 }}
      >
        Get AI Project Ideas
      </Button>
    );
  }

  if (variant === 'banner') {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          mb: 3,
          bgcolor: 'primary.light',
          borderRadius: 1,
          color: 'primary.contrastText',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <LightbulbIcon />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            <Typography variant="body2">{description}</Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleClick}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Generate Ideas
        </Button>
      </Box>
    );
  }

  // Default: card variant
  return (
    <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <LightbulbIcon sx={{ fontSize: 40, mt: 0.5 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
              {description}
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleClick}
              startIcon={<LightbulbIcon />}
            >
              Get AI Project Ideas
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
