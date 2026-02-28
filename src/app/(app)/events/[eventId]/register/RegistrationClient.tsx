"use client";

import { useState } from "react";
import {
  Box,
  Alert,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import RegistrationWizard from "@/components/registration/RegistrationWizard";
import StepOne from "@/components/registration/StepOne";
import StepTwo from "@/components/registration/StepTwo";
import StepThree from "@/components/registration/StepThree";

interface CustomQuestion {
  id: string;
  label: string;
  type: "text" | "select" | "multiselect" | "checkbox";
  options: string[];
  required: boolean;
  placeholder: string;
}

interface FormConfig {
  _id: string;
  name: string;
  tier1: {
    showExperienceLevel: boolean;
    customQuestions: CustomQuestion[];
  };
  tier2: {
    enabled: boolean;
    prompt: string;
    showSkills: boolean;
    showGithub: boolean;
    showBio: boolean;
    customQuestions: CustomQuestion[];
  };
  tier3: {
    enabled: boolean;
    prompt: string;
    customQuestions: CustomQuestion[];
  };
}

interface RegistrationClientProps {
  event: any;
  eventId: string;
  registeredCount: number;
  spotsRemaining: number | null;
  isLoggedIn: boolean;
  userEmail?: string;
  userName?: string;
  formConfig?: FormConfig | null;
}

export default function RegistrationClient({
  event,
  eventId,
  isLoggedIn,
  userEmail,
  userName,
  formConfig,
}: RegistrationClientProps) {
  const router = useRouter();
  
  // Step 1 state
  const [email, setEmail] = useState(userEmail || "");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // Step 2 state
  const [name, setName] = useState(userName || "");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [github, setGithub] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  
  // Step 3 state (custom questions)
  const [customAnswers, setCustomAnswers] = useState<Record<string, unknown>>({});
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Gather all custom questions from all tiers
  const allCustomQuestions: CustomQuestion[] = formConfig
    ? [
        ...formConfig.tier1.customQuestions,
        ...(formConfig.tier2.enabled ? formConfig.tier2.customQuestions : []),
        ...(formConfig.tier3.enabled ? formConfig.tier3.customQuestions : []),
      ]
    : [];

  const handleComplete = async () => {
    setIsSubmitting(true);
    setError("");

    // Validation
    if (!isLoggedIn && password.length < 8) {
      setError("Password must be at least 8 characters");
      setIsSubmitting(false);
      return;
    }

    if (!termsAccepted) {
      setError("Please accept the Terms of Service and Privacy Policy");
      setIsSubmitting(false);
      return;
    }

    if (skills.length === 0) {
      setError("Please select at least one skill");
      setIsSubmitting(false);
      return;
    }

    // Validate required custom questions
    for (const q of allCustomQuestions) {
      if (q.required) {
        const answer = customAnswers[q.id];
        if (!answer || (Array.isArray(answer) && answer.length === 0) || answer === "") {
          setError(`Please answer: "${q.label}"`);
          setIsSubmitting(false);
          return;
        }
      }
    }

    try {
      const payload: Record<string, unknown> = {
        name,
        email,
        skills,
      };

      // Only send password for new users
      if (!isLoggedIn) {
        payload.password = password;
      }

      // Include form config fields
      if (formConfig) {
        if (formConfig.tier1.showExperienceLevel && experienceLevel) {
          payload.experienceLevel = experienceLevel;
        }
        if (formConfig.tier2.enabled) {
          if (formConfig.tier2.showGithub && github) {
            payload.github = github;
          }
          if (formConfig.tier2.showBio && bio) {
            payload.bio = bio;
          }
        }
        if (Object.keys(customAnswers).length > 0) {
          payload.customAnswers = customAnswers;
        }
      }

      const response = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === "EXISTING_USER" && data.loginUrl) {
          router.push(data.loginUrl);
          return;
        }
        throw new Error(data.error || "Failed to register");
      }

      // Clear saved progress
      sessionStorage.removeItem("registrationStep");

      // Auto-login if not logged in
      if (!isLoggedIn && password) {
        const signInResult = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (signInResult?.ok) {
          window.location.href = `/events/${eventId}/hub`;
        } else {
          window.location.href = `/login?redirect=/events/${eventId}/hub`;
        }
      } else {
        window.location.href = `/events/${eventId}/hub`;
      }
    } catch (err: any) {
      setError(err.message || "Failed to register. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const setCustomAnswer = (questionId: string, value: unknown) => {
    setCustomAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <RegistrationWizard onComplete={handleComplete} isSubmitting={isSubmitting}>
        {/* Step 1: Account */}
        <StepOne
          email={email}
          onEmailChange={setEmail}
          password={password}
          onPasswordChange={setPassword}
          termsAccepted={termsAccepted}
          onTermsChange={setTermsAccepted}
          isLoggedIn={isLoggedIn}
          error={error}
        />

        {/* Step 2: Profile */}
        <StepTwo
          name={name}
          onNameChange={setName}
          bio={bio}
          onBioChange={setBio}
          skills={skills}
          onSkillsChange={setSkills}
          github={github}
          onGithubChange={setGithub}
          experienceLevel={experienceLevel}
          onExperienceLevelChange={setExperienceLevel}
          showGithub={formConfig?.tier2.enabled && formConfig.tier2.showGithub || false}
          showBio={formConfig?.tier2.enabled && formConfig.tier2.showBio || false}
          showExperienceLevel={formConfig?.tier1.showExperienceLevel || false}
        />

        {/* Step 3: Custom Questions */}
        <StepThree
          customQuestions={allCustomQuestions}
          customAnswers={customAnswers}
          onCustomAnswerChange={setCustomAnswer}
        />
      </RegistrationWizard>
    </Box>
  );
}
