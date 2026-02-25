"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Alert,
} from "@mui/material";
import { Save as SaveIcon, Cancel as CancelIcon, Add as AddIcon, Close as CloseIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";

export default function NewTeamPage({ params }: { params: { eventId: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [skillInput, setSkillInput] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    maxMembers: 5,
    desiredSkills: [] as string[],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.desiredSkills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        desiredSkills: [...prev.desiredSkills, skillInput.trim()],
      }));
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      desiredSkills: prev.desiredSkills.filter((s) => s !== skill),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/events/${params.eventId}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/events/${params.eventId}/teams`);
      } else {
        setError(data.error || "Failed to create team");
      }
    } catch (err) {
      setError("An error occurred while creating the team");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Create Your Team
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Form a team and find members with complementary skills
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card elevation={2}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Team Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., MongoDB Wizards"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Team Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your team's goals, project idea, and what you're looking for..."
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Maximum Team Members"
                  name="maxMembers"
                  type="number"
                  value={formData.maxMembers}
                  onChange={handleChange}
                  required
                  inputProps={{ min: 2, max: 10 }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Skills We're Looking For
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="e.g., React, Python, UI/UX"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddSkill}
                  >
                    Add
                  </Button>
                </Box>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {formData.desiredSkills.map((skill) => (
                    <Chip
                      key={skill}
                      label={skill}
                      onDelete={() => handleRemoveSkill(skill)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 3 }}>
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Team"}
          </Button>
        </Box>
      </form>
    </Box>
  );
}
