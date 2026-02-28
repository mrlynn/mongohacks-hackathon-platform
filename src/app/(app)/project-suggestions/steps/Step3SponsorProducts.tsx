'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Checkbox,
  Typography,
} from '@mui/material';

const SPONSORS = ['MongoDB Atlas', 'Twilio', 'OpenAI', 'Stripe', 'Auth0', 'Vercel'];

export default function Step3SponsorProducts({ data, onUpdate, onNext, onBack }: any) {
  const [sponsorProducts, setSponsorProducts] = useState<string[]>(data.sponsorProducts || []);

  const handleToggle = (sponsor: string) => {
    setSponsorProducts((prev) =>
      prev.includes(sponsor) ? prev.filter((s) => s !== sponsor) : [...prev, sponsor]
    );
  };

  const handleNext = () => {
    onUpdate({ sponsorProducts });
    onNext();
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Step 3: Sponsor Products</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Select sponsor products you'd like to use (increases prize eligibility)
      </Typography>

      <FormControl component="fieldset" sx={{ mb: 3 }}>
        {SPONSORS.map((sponsor) => (
          <FormControlLabel
            key={sponsor}
            control={
              <Checkbox
                checked={sponsorProducts.includes(sponsor)}
                onChange={() => handleToggle(sponsor)}
              />
            }
            label={sponsor}
          />
        ))}
      </FormControl>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onBack}>← Back</Button>
        <Button variant="contained" onClick={handleNext}>Next →</Button>
      </Box>
    </Box>
  );
}
