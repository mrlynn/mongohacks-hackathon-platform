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
  FormControlLabel,
  Radio,
  Alert,
  CircularProgress,
  ListItemText,
} from '@mui/material';

const SKILL_OPTIONS = ['beginner', 'intermediate', 'advanced'];
const ROLE_OPTIONS = ['Frontend', 'Backend', 'Full-stack', 'Design', 'Data Science', 'DevOps'];

interface Event {
  _id: string;
  name: string;
  theme?: string;
  startDate: string;
  endDate: string;
  status: string;
  registered: boolean;
}

export default function Step1EventTeam({ data, onUpdate, onNext }: any) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);
  
  const [eventId, setEventId] = useState(data.eventId || '');
  const [teamSize, setTeamSize] = useState(data.teamSize || 1);
  const [skillLevels, setSkillLevels] = useState<string[]>(data.skillLevels || []);
  const [teamComposition, setTeamComposition] = useState<string[]>(data.teamComposition || []);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/project-suggestions/events');
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      setEvents(data.events || []);
      
      // Auto-select first registered event if available
      if (data.events.length > 0 && !eventId) {
        const firstRegistered = data.events.find((e: Event) => e.registered);
        if (firstRegistered) {
          setEventId(firstRegistered._id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setEventsError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoadingEvents(false);
    }
  };

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

  const selectedEvent = events.find((e) => e._id === eventId);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Step 1: Event & Team
      </Typography>

      {/* Event Selection */}
      {loadingEvents ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" color="text.secondary">
            Loading your events...
          </Typography>
        </Box>
      ) : eventsError ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {eventsError}
        </Alert>
      ) : events.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          No events found. You need to register for an event first.
        </Alert>
      ) : (
        <>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Select Event</InputLabel>
            <Select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              label="Select Event"
            >
              {events.map((event) => (
                <MenuItem key={event._id} value={event._id}>
                  <ListItemText
                    primary={event.name}
                    secondary={
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {event.theme && <span>{event.theme} • </span>}
                        <span>{new Date(event.startDate).toLocaleDateString()}</span>
                        {event.registered && (
                          <Chip label="Registered" size="small" color="success" sx={{ ml: 1 }} />
                        )}
                      </Box>
                    }
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedEvent && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {selectedEvent.name}
              </Typography>
              {selectedEvent.theme && (
                <Typography variant="caption" display="block">
                  Theme: {selectedEvent.theme}
                </Typography>
              )}
              <Typography variant="caption" display="block">
                {new Date(selectedEvent.startDate).toLocaleDateString()} - {new Date(selectedEvent.endDate).toLocaleDateString()}
              </Typography>
            </Alert>
          )}
        </>
      )}

      {/* Team Size */}
      <FormControl component="fieldset" sx={{ mb: 3 }}>
        <FormLabel>Team Size</FormLabel>
        <RadioGroup
          row
          value={teamSize}
          onChange={(e) => setTeamSize(Number(e.target.value))}
        >
          <FormControlLabel value={1} control={<Radio />} label="Solo" />
          <FormControlLabel value={3} control={<Radio />} label="2-5 people" />
          <FormControlLabel value={6} control={<Radio />} label="5+ people" />
        </RadioGroup>
      </FormControl>

      {/* Skill Levels */}
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

      {/* Team Composition */}
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
