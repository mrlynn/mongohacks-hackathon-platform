'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Container,
  Paper,
  Alert,
} from '@mui/material';
import Step1EventTeam from './steps/Step1EventTeam';
import Step2TechPreferences from './steps/Step2TechPreferences';
import Step3SponsorProducts from './steps/Step3SponsorProducts';
import Step4ConstraintsGoals from './steps/Step4ConstraintsGoals';
import ResultsDisplay from './ResultsDisplay';

const steps = ['Event & Team', 'Tech Preferences', 'Sponsor Products', 'Constraints & Goals'];

interface WizardData {
  // Step 1
  eventId: string;
  teamSize: number;
  skillLevels: string[];
  teamComposition: string[];
  
  // Step 2
  preferredLanguages: string[];
  preferredFrameworks: string[];
  preferredDatabases: string[];
  
  // Step 3
  sponsorProducts: string[];
  
  // Step 4
  interestAreas: string[];
  timeCommitment: number;
  complexityPreference: 'simple' | 'moderate' | 'ambitious';
  targetPrizes: string[];
}

export default function ProjectSuggestionWizard({ userId }: { userId: string }) {
  const [activeStep, setActiveStep] = useState(0);
  const [wizardData, setWizardData] = useState<Partial<WizardData>>({});
  const [generatedIdeas, setGeneratedIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const updateWizardData = (data: Partial<WizardData>) => {
    setWizardData((prev) => ({ ...prev, ...data }));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/project-suggestions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: wizardData.eventId,
          inputs: {
            teamSize: wizardData.teamSize,
            skillLevels: wizardData.skillLevels,
            teamComposition: wizardData.teamComposition,
            preferredLanguages: wizardData.preferredLanguages,
            preferredFrameworks: wizardData.preferredFrameworks,
            preferredDatabases: wizardData.preferredDatabases,
            sponsorProducts: wizardData.sponsorProducts,
            interestAreas: wizardData.interestAreas,
            timeCommitment: wizardData.timeCommitment,
            complexityPreference: wizardData.complexityPreference,
            targetPrizes: wizardData.targetPrizes,
          },
          numIdeas: 3,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate ideas');
      }

      setGeneratedIdeas(data.ideas);
      setActiveStep(4); // Move to results step
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <Step1EventTeam
            data={wizardData}
            onUpdate={updateWizardData}
            onNext={handleNext}
          />
        );
      case 1:
        return (
          <Step2TechPreferences
            data={wizardData}
            onUpdate={updateWizardData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <Step3SponsorProducts
            data={wizardData}
            onUpdate={updateWizardData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <Step4ConstraintsGoals
            data={wizardData}
            onUpdate={updateWizardData}
            onGenerate={handleGenerate}
            onBack={handleBack}
            loading={loading}
          />
        );
      case 4:
        return <ResultsDisplay ideas={generatedIdeas} />;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          🚀 AI Project Suggestion Tool
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Let's find the perfect project for your hackathon!
        </Typography>

        {activeStep < 4 && (
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box>{renderStep()}</Box>
      </Paper>
    </Container>
  );
}
