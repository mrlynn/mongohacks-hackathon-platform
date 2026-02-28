'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
  FormLabel,
  RadioGroup,
  FormControlRadio,
  Radio,
} from '@mui/material';

const SKILL_OPTIONS = ['beginner', 'intermediate', 'advanced'];
const ROLE_OPTIONS = ['Frontend', 'Backend', 'Full-stack', 'Design', 'Data Science', 'DevOps'];

export default function Step1EventTeam({ data, onUpdate, onNext }: any) {
  const [eventId, setEventId] = useState(data.eventId || '');
  const [teamSize, setTeamSize] = useState(data.teamSize || 1);
  const [skillLevels, setSkillLevels] = useState<string[]>(data.skillLevels || []);
  const [teamComposition, setTeamComposition] = useState<string[]>(data.teamComposition || []);

  const handleNext = () => {
    onUpdate({
      eventId,
      teamSize,
      skillLevels,
      teamComposition,
    });
    onNext();
  };

  const canProceed = eventId && teamSize > 0 && skillLevels.length > 0;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Step 1: Event & Team
      </Typography>

      <TextField
        fullWidth
        label="Event ID"
        value={eventId}
        onChange={(e) => setEventId(e.target.value)}
        placeholder="Enter event ID or select from registered events"
        helperText="Paste an event ID from your registered events"
        sx={{ mb: 3 }}
      />

      <FormControl component="fieldset" sx={{ mb: 3 }}>
        <FormLabel>Team Size</FormLabel>
        <RadioGroup
          row
          value={teamSize}
          onChange={(e) => setTeamSize(Number(e.target.value))}
        >
          <FormControlRadio value={1} control={<Radio />} label="Solo" />
          <FormControlRadio value={3} control={<Radio />} label="2-5 people" />
          <FormControlRadio value={6} control={<Radio />} label="5+ people" />
        </RadioGroup>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Skill Levels</InputLabel>
        <Select
          multiple
          value={skillLevels}
          onChange={(e) => setSkillLevels(e.target.value as string[])}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} size="small" />
              ))}
            </Box>
          )}
        >
          {SKILL_OPTIONS.map((skill) => (
            <MenuItem key={skill} value={skill}>
              {skill}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Team Composition</InputLabel>
        <Select
          multiple
          value={teamComposition}
          onChange={(e) => setTeamComposition(e.target.value as string[])}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} size="small" />
              ))}
            </Box>
          )}
        >
          {ROLE_OPTIONS.map((role) => (
            <MenuItem key={role} value={role}>
              {role}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={!canProceed}
          size="large"
        >
          Next →
        </Button>
      </Box>
    </Box>
  );
}
