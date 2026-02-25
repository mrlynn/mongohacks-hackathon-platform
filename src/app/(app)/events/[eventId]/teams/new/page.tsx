"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  InputAdornment,
} from "@mui/material";
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  GroupsOutlined,
  DescriptionOutlined,
  PeopleOutlined,
  BuildOutlined,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import {
  PageHeader,
  FormCard,
  FormSectionHeader,
  ChipInput,
  FormActions,
} from "@/components/shared-ui/FormElements";

export default function NewTeamPage({
  params,
}: {
  params: { eventId: string };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    maxMembers: 5,
    desiredSkills: [] as string[],
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
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
      <PageHeader
        icon={<GroupsOutlined />}
        title="Create Your Team"
        subtitle="Form a team and find members with complementary skills"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <FormCard>
          <FormSectionHeader
            icon={<GroupsOutlined />}
            title="Team Details"
            subtitle="Basic information about your team"
          />

          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Team Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., MongoDB Wizards"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <GroupsOutlined
                          sx={{ color: "text.secondary", fontSize: 20 }}
                        />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Team Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your team's goals, project idea, and what you're looking for..."
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment
                        position="start"
                        sx={{ alignSelf: "flex-start", mt: 1.5 }}
                      >
                        <DescriptionOutlined
                          sx={{ color: "text.secondary", fontSize: 20 }}
                        />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Maximum Team Members"
                name="maxMembers"
                type="number"
                value={formData.maxMembers}
                onChange={handleChange}
                required
                inputProps={{ min: 2, max: 10 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PeopleOutlined
                          sx={{ color: "text.secondary", fontSize: 20 }}
                        />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <ChipInput
                label="Skills We're Looking For"
                placeholder="e.g., React, Python, UI/UX"
                values={formData.desiredSkills}
                onChange={(skills) =>
                  setFormData((prev) => ({ ...prev, desiredSkills: skills }))
                }
                icon={
                  <BuildOutlined
                    sx={{ color: "text.secondary", fontSize: 20 }}
                  />
                }
              />
            </Grid>
          </Grid>
        </FormCard>

        <FormActions>
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
        </FormActions>
      </form>
    </Box>
  );
}
