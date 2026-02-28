'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  CircularProgress,
} from '@mui/material';

export default function Step4ConstraintsGoals({ data, onUpdate, onGenerate, onBack, loading }: any) {
  const [interestAreas, setInterestAreas] = useState(data.interestAreas || []);
  const [timeCommitment, setTimeCommitment] = useState(data.timeCommitment || 24);
  const [complexityPreference, setComplexityPreference] = useState(data.complexityPreference || 'moderate');
  const [targetPrizes, setTargetPrizes] = useState(data.targetPrizes || []);

  const handleGenerate = () => {
    onUpdate({
      interestAreas,
      timeCommitment,
      complexityPreference,
      targetPrizes,
    });
    onGenerate();
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Step 4: Constraints & Goals</Typography>

      <FormControl component="fieldset" sx={{ mb: 3 }}>
        <FormLabel>Time Commitment</FormLabel>
        <RadioGroup value={timeCommitment} onChange={(e) => setTimeCommitment(Number(e.target.value))}>
          <FormControlLabel value={12} control={<Radio />} label="12 hours" />
          <FormControlLabel value={24} control={<Radio />} label="24 hours" />
          <FormControlLabel value={48} control={<Radio />} label="48 hours" />
        </RadioGroup>
      </FormControl>

      <FormControl component="fieldset" sx={{ mb: 3 }}>
        <FormLabel>Complexity</FormLabel>
        <RadioGroup value={complexityPreference} onChange={(e) => setComplexityPreference(e.target.value)}>
          <FormControlLabel value="simple" control={<Radio />} label="Simple MVP" />
          <FormControlLabel value="moderate" control={<Radio />} label="Moderate features" />
          <FormControlLabel value="ambitious" control={<Radio />} label="Ambitious project" />
        </RadioGroup>
      </FormControl>

      <TextField
        fullWidth
        label="Interest Areas (comma-separated)"
        value={interestAreas.join(', ')}
        onChange={(e) => setInterestAreas(e.target.value.split(',').map(s => s.trim()))}
        placeholder="Healthcare, Education, Climate"
        sx={{ mb: 3 }}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onBack} disabled={loading}>← Back</Button>
        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={loading}
          size="large"
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? 'Generating...' : '✨ Generate Ideas'}
        </Button>
      </Box>
    </Box>
  );
}
