"use client";

import { useState, ReactNode } from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  Container,
} from "@mui/material";
import { ArrowBack, ArrowForward, CheckCircle } from "@mui/icons-material";

interface RegistrationWizardProps {
  children: ReactNode[];
  onComplete: () => void | Promise<void>;
  isSubmitting?: boolean;
}

const steps = ["Account", "Profile", "Preferences"];

export default function RegistrationWizard({
  children,
  onComplete,
  isSubmitting = false,
}: RegistrationWizardProps) {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      onComplete();
    } else {
      setActiveStep((prev) => prev + 1);
      // Save progress to sessionStorage
      sessionStorage.setItem("registrationStep", String(activeStep + 1));
      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    sessionStorage.setItem("registrationStep", String(activeStep - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Restore step from sessionStorage on mount
  useState(() => {
    const savedStep = sessionStorage.getItem("registrationStep");
    if (savedStep) {
      setActiveStep(parseInt(savedStep, 10));
    }
  });

  const isLastStep = activeStep === steps.length - 1;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        <Box sx={{ minHeight: 400 }}>
          {children[activeStep]}
        </Box>

        {/* Navigation Buttons */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBack />}
          >
            Back
          </Button>

          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Step {activeStep + 1} of {steps.length}
            </Typography>
            
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={isSubmitting}
              endIcon={isLastStep ? <CheckCircle /> : <ArrowForward />}
            >
              {isSubmitting
                ? "Submitting..."
                : isLastStep
                ? "Complete Registration"
                : "Next"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
