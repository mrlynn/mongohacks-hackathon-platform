"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid2 as Grid,
  Chip,
  Alert,
  MenuItem,
} from "@mui/material";
import { Save as SaveIcon, Cancel as CancelIcon, Add as AddIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";

const categories = [
  "AI/ML",
  "Web Development",
  "Mobile Apps",
  "Blockchain/Web3",
  "IoT/Hardware",
  "Climate Tech",
  "HealthTech",
  "FinTech",
  "EdTech",
  "Social Impact",
  "Gaming",
  "DevTools",
  "Other",
];

export default function NewProjectPage({ params }: { params: { eventId: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [techInput, setTechInput] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    technologies: [] as string[],
    repoUrl: "",
    demoUrl: "",
    documentationUrl: "",
    innovations: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAddTech = () => {
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        technologies: [...prev.technologies, techInput.trim()],
      }));
      setTechInput("");
    }
  };

  const handleRemoveTech = (tech: string) => {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((t) => t !== tech),
    }));
  };

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/events/${params.eventId}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          status: isDraft ? "draft" : "submitted",
          submissionDate: isDraft ? undefined : new Date(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/events/${params.eventId}/projects`);
      } else {
        setError(data.error || "Failed to submit project");
      }
    } catch (err) {
      setError("An error occurred while submitting the project");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Submit Your Project
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Share your hackathon project with the judges
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <form>
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Project Information
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Project Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Smart City Dashboard"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={5}
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="Describe your project, what problem it solves, and how it works..."
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Technologies Used
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="e.g., MongoDB, React, Python"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTech();
                      }
                    }}
                  />
                  <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddTech}>
                    Add
                  </Button>
                </Box>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {formData.technologies.map((tech) => (
                    <Chip
                      key={tech}
                      label={tech}
                      onDelete={() => handleRemoveTech(tech)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Key Innovations"
                  name="innovations"
                  value={formData.innovations}
                  onChange={handleChange}
                  placeholder="What makes your project unique? What technical challenges did you solve?"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Links & Resources
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Repository URL"
                  name="repoUrl"
                  value={formData.repoUrl}
                  onChange={handleChange}
                  required
                  placeholder="https://github.com/username/project"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Demo URL (optional)"
                  name="demoUrl"
                  value={formData.demoUrl}
                  onChange={handleChange}
                  placeholder="https://demo.example.com"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Documentation URL (optional)"
                  name="documentationUrl"
                  value={formData.documentationUrl}
                  onChange={handleChange}
                  placeholder="https://docs.example.com"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="outlined"
            onClick={(e) => handleSubmit(e, true)}
            disabled={loading}
          >
            Save as Draft
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={(e) => handleSubmit(e, false)}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Project"}
          </Button>
        </Box>
      </form>
    </Box>
  );
}
