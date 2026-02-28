"use client";

import {
  Box,
  TextField,
  Typography,
  Autocomplete,
  InputAdornment,
  MenuItem,
  Chip,
} from "@mui/material";
import {
  Person as PersonIcon,
  Code as CodeIcon,
  GitHub as GitHubIcon,
} from "@mui/icons-material";

const skillOptions = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "Go", "Rust",
  "React", "Vue", "Angular", "Next.js", "Node.js", "Express",
  "MongoDB", "PostgreSQL", "MySQL", "Redis",
  "AWS", "Azure", "GCP", "Docker", "Kubernetes",
  "GraphQL", "REST API", "WebSockets",
  "Machine Learning", "AI", "Data Science",
  "UI/UX Design", "Product Management", "DevOps",
];

const experienceLevels = [
  { value: "beginner", label: "Beginner — New to hackathons" },
  { value: "intermediate", label: "Intermediate — A few under my belt" },
  { value: "advanced", label: "Advanced — Seasoned hacker" },
];

interface StepTwoProps {
  name: string;
  onNameChange: (name: string) => void;
  bio: string;
  onBioChange: (bio: string) => void;
  skills: string[];
  onSkillsChange: (skills: string[]) => void;
  github: string;
  onGithubChange: (github: string) => void;
  experienceLevel: string;
  onExperienceLevelChange: (level: string) => void;
  showGithub: boolean;
  showBio: boolean;
  showExperienceLevel: boolean;
}

export default function StepTwo({
  name,
  onNameChange,
  bio,
  onBioChange,
  skills,
  onSkillsChange,
  github,
  onGithubChange,
  experienceLevel,
  onExperienceLevelChange,
  showGithub,
  showBio,
  showExperienceLevel,
}: StepTwoProps) {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
        Tell Us About Yourself
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Help us match you with the right team and challenges
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <TextField
          fullWidth
          required
          label="Full Name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="John Doe"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon />
              </InputAdornment>
            ),
          }}
        />

        <Autocomplete
          multiple
          options={skillOptions}
          value={skills}
          onChange={(_, newValue) => onSkillsChange(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Skills & Technologies"
              placeholder="Select your skills"
              helperText="Select at least one skill (helps with team matching)"
              required
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <InputAdornment position="start">
                      <CodeIcon />
                    </InputAdornment>
                    {params.InputProps.startAdornment}
                  </>
                ),
              }}
            />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                label={option}
                size="small"
                {...getTagProps({ index })}
                key={option}
              />
            ))
          }
        />

        {showBio && (
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Bio"
            value={bio}
            onChange={(e) => onBioChange(e.target.value)}
            placeholder="Tell us a bit about yourself and what you're excited to build..."
            helperText="Optional — helps teams get to know you"
          />
        )}

        {showGithub && (
          <TextField
            fullWidth
            label="GitHub Username"
            value={github}
            onChange={(e) => onGithubChange(e.target.value)}
            placeholder="octocat"
            helperText="Optional — we'll link to your profile"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <GitHubIcon />
                </InputAdornment>
              ),
            }}
          />
        )}

        {showExperienceLevel && (
          <TextField
            fullWidth
            select
            label="Hackathon Experience"
            value={experienceLevel}
            onChange={(e) => onExperienceLevelChange(e.target.value)}
            helperText="Helps us provide the right support level"
          >
            {experienceLevels.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        )}
      </Box>
    </Box>
  );
}
