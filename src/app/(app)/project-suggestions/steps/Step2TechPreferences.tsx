'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
} from '@mui/material';

const LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++'];
const FRAMEWORKS = ['React', 'Next.js', 'Vue', 'Angular', 'Flask', 'Django', 'Express', 'Spring Boot'];
const DATABASES = ['MongoDB Atlas', 'PostgreSQL', 'Redis', 'MySQL', 'Supabase', 'Firebase'];

export default function Step2TechPreferences({ data, onUpdate, onNext, onBack }: any) {
  const [preferredLanguages, setPreferredLanguages] = useState<string[]>(data.preferredLanguages || []);
  const [preferredFrameworks, setPreferredFrameworks] = useState<string[]>(data.preferredFrameworks || []);
  const [preferredDatabases, setPreferredDatabases] = useState<string[]>(data.preferredDatabases || []);

  const handleNext = () => {
    onUpdate({
      preferredLanguages,
      preferredFrameworks,
      preferredDatabases,
    });
    onNext();
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Step 2: Technology Preferences
      </Typography>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Programming Languages</InputLabel>
        <Select
          multiple
          value={preferredLanguages}
          onChange={(e) => setPreferredLanguages(e.target.value as string[])}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (<Chip key={value} label={value} size="small" />))}
            </Box>
          )}
        >
          {LANGUAGES.map((lang) => (<MenuItem key={lang} value={lang}>{lang}</MenuItem>))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Frameworks</InputLabel>
        <Select
          multiple
          value={preferredFrameworks}
          onChange={(e) => setPreferredFrameworks(e.target.value as string[])}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (<Chip key={value} label={value} size="small" />))}
            </Box>
          )}
        >
          {FRAMEWORKS.map((fw) => (<MenuItem key={fw} value={fw}>{fw}</MenuItem>))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Databases</InputLabel>
        <Select
          multiple
          value={preferredDatabases}
          onChange={(e) => setPreferredDatabases(e.target.value as string[])}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (<Chip key={value} label={value} size="small" />))}
            </Box>
          )}
        >
          {DATABASES.map((db) => (<MenuItem key={db} value={db}>{db}</MenuItem>))}
        </Select>
      </FormControl>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onBack}>← Back</Button>
        <Button variant="contained" onClick={handleNext}>Next →</Button>
      </Box>
    </Box>
  );
}
