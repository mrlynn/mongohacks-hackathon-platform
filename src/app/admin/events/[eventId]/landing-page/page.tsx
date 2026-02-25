"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  IconButton,
  Chip,
} from "@mui/material";
import {
  Save as SaveIcon,
  Preview as PreviewIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface LandingPageFormData {
  template: "modern" | "bold" | "tech";
  slug: string;
  published: boolean;
  customContent: {
    hero: {
      headline: string;
      subheadline: string;
      ctaText: string;
      backgroundImage: string;
    };
    about: string;
    prizes: Array<{ title: string; description: string; value: string }>;
    schedule: Array<{ time: string; title: string; description: string }>;
    sponsors: Array<{ name: string; logo: string; tier: string }>;
    faq: Array<{ question: string; answer: string }>;
  };
}

export default function LandingPageBuilder({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const router = useRouter();
  const [eventId, setEventId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [eventName, setEventName] = useState("");

  const [formData, setFormData] = useState<LandingPageFormData>({
    template: "modern",
    slug: "",
    published: false,
    customContent: {
      hero: {
        headline: "",
        subheadline: "",
        ctaText: "Register Now",
        backgroundImage: "",
      },
      about: "",
      prizes: [],
      schedule: [],
      sponsors: [],
      faq: [],
    },
  });

  useEffect(() => {
    params.then((p) => {
      setEventId(p.eventId);
      fetchEvent(p.eventId);
    });
  }, []);

  const fetchEvent = async (id: string) => {
    try {
      console.log('Fetching event:', id);
      const res = await fetch(`/api/admin/events/${id}`);
      const data = await res.json();
      
      console.log('Event fetch response:', { status: res.status, data });
      
      if (res.ok && data.event) {
        setEventName(data.event.name);
        
        // Load existing landing page if exists
        if (data.event.landingPage) {
          console.log('Loading existing landing page:', data.event.landingPage);
          setFormData({
            template: data.event.landingPage.template || "modern",
            slug: data.event.landingPage.slug || "",
            published: data.event.landingPage.published || false,
            customContent: data.event.landingPage.customContent || formData.customContent,
          });
        } else {
          // Generate default slug from event name
          console.log('No landing page found, generating default slug');
          const defaultSlug = data.event.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
          setFormData((prev) => ({ ...prev, slug: defaultSlug }));
        }
      } else {
        setError(data.error || data.message || "Failed to load event");
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch event:', err);
      setError("Failed to load event: " + String(err));
      setLoading(false);
    }
  };

  const handleSave = async (publish = false) => {
    console.log('handleSave called', { eventId, publish, formData });
    
    if (!eventId) {
      setError("Event ID is missing");
      return;
    }
    
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...formData,
        published: publish ? true : formData.published,
      };
      
      console.log('Sending PUT request to:', `/api/admin/events/${eventId}/landing-page`);
      console.log('Payload:', JSON.stringify(payload, null, 2));
      
      const res = await fetch(`/api/admin/events/${eventId}/landing-page`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);

      if (res.ok) {
        setSuccess(publish ? "Landing page published!" : "Landing page saved!");
        if (publish) {
          setFormData((prev) => ({ ...prev, published: true }));
        }
      } else {
        setError(data.message || "Failed to save landing page");
      }
    } catch (err) {
      console.error('Save error:', err);
      setError("Failed to save landing page: " + String(err));
    } finally {
      setSaving(false);
    }
  };

  const addPrize = () => {
    setFormData((prev) => ({
      ...prev,
      customContent: {
        ...prev.customContent,
        prizes: [
          ...prev.customContent.prizes,
          { title: "", description: "", value: "" },
        ],
      },
    }));
  };

  const removePrize = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      customContent: {
        ...prev.customContent,
        prizes: prev.customContent.prizes.filter((_, i) => i !== index),
      },
    }));
  };

  const updatePrize = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const prizes = [...prev.customContent.prizes];
      prizes[index] = { ...prizes[index], [field]: value };
      return {
        ...prev,
        customContent: { ...prev.customContent, prizes },
      };
    });
  };

  const addScheduleItem = () => {
    setFormData((prev) => ({
      ...prev,
      customContent: {
        ...prev.customContent,
        schedule: [
          ...prev.customContent.schedule,
          { time: "", title: "", description: "" },
        ],
      },
    }));
  };

  const removeScheduleItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      customContent: {
        ...prev.customContent,
        schedule: prev.customContent.schedule.filter((_, i) => i !== index),
      },
    }));
  };

  const updateScheduleItem = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const schedule = [...prev.customContent.schedule];
      schedule[index] = { ...schedule[index], [field]: value };
      return {
        ...prev,
        customContent: { ...prev.customContent, schedule },
      };
    });
  };

  const addFAQ = () => {
    setFormData((prev) => ({
      ...prev,
      customContent: {
        ...prev.customContent,
        faq: [...prev.customContent.faq, { question: "", answer: "" }],
      },
    }));
  };

  const removeFAQ = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      customContent: {
        ...prev.customContent,
        faq: prev.customContent.faq.filter((_, i) => i !== index),
      },
    }));
  };

  const updateFAQ = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const faq = [...prev.customContent.faq];
      faq[index] = { ...faq[index], [field]: value };
      return {
        ...prev,
        customContent: { ...prev.customContent, faq },
      };
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Landing Page Builder
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {eventName}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          {formData.published && (
            <Button
              variant="outlined"
              startIcon={<VisibilityIcon />}
              component={Link}
              href={`/${formData.slug}`}
              target="_blank"
            >
              View Live
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<PreviewIcon />}
            href={`/${formData.slug}?preview=true`}
            target="_blank"
            disabled={!formData.slug}
          >
            Preview
          </Button>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            Save Draft
          </Button>
          <Button
            variant="contained"
            onClick={() => handleSave(true)}
            disabled={saving || !formData.slug}
          >
            Publish
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Template Selection */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Template
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Template Style</InputLabel>
                <Select
                  value={formData.template}
                  label="Template Style"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      template: e.target.value as any,
                    }))
                  }
                >
                  <MenuItem value="modern">Modern - Clean & Professional</MenuItem>
                  <MenuItem value="bold">Bold - Vibrant & Energetic</MenuItem>
                  <MenuItem value="tech">Tech - Dark & Futuristic</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {/* URL Settings */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                URL Settings
              </Typography>
              <TextField
                fullWidth
                label="URL Slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                helperText={`Landing page will be accessible at: /${formData.slug}`}
                sx={{ mb: 2 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.published}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        published: e.target.checked,
                      }))
                    }
                  />
                }
                label="Published (visible to public)"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Hero Section */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Hero Section
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Headline"
                    value={formData.customContent.hero.headline}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        customContent: {
                          ...prev.customContent,
                          hero: {
                            ...prev.customContent.hero,
                            headline: e.target.value,
                          },
                        },
                      }))
                    }
                    placeholder="Build the Future with MongoDB"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Subheadline"
                    value={formData.customContent.hero.subheadline}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        customContent: {
                          ...prev.customContent,
                          hero: {
                            ...prev.customContent.hero,
                            subheadline: e.target.value,
                          },
                        },
                      }))
                    }
                    placeholder="Join developers worldwide in a 48-hour coding challenge"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="CTA Button Text"
                    value={formData.customContent.hero.ctaText}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        customContent: {
                          ...prev.customContent,
                          hero: {
                            ...prev.customContent.hero,
                            ctaText: e.target.value,
                          },
                        },
                      }))
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Background Image URL"
                    value={formData.customContent.hero.backgroundImage}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        customContent: {
                          ...prev.customContent,
                          hero: {
                            ...prev.customContent.hero,
                            backgroundImage: e.target.value,
                          },
                        },
                      }))
                    }
                    placeholder="https://..."
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* About Section */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                About Section
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="About Text"
                value={formData.customContent.about}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    customContent: {
                      ...prev.customContent,
                      about: e.target.value,
                    },
                  }))
                }
                placeholder="Describe the hackathon, its goals, and what participants can expect..."
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Prizes Section */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Prizes
                </Typography>
                <Button startIcon={<AddIcon />} onClick={addPrize} size="small">
                  Add Prize
                </Button>
              </Box>
              {formData.customContent.prizes.map((prize, idx) => (
                <Box key={idx} sx={{ mb: 3, p: 2, border: "1px solid", borderColor: "grey.300", borderRadius: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Typography variant="subtitle2">Prize {idx + 1}</Typography>
                    <IconButton size="small" onClick={() => removePrize(idx)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        fullWidth
                        label="Title"
                        value={prize.title}
                        onChange={(e) => updatePrize(idx, "title", e.target.value)}
                        placeholder="1st Place"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        fullWidth
                        label="Value"
                        value={prize.value}
                        onChange={(e) => updatePrize(idx, "value", e.target.value)}
                        placeholder="$5,000"
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Description"
                        value={prize.description}
                        onChange={(e) => updatePrize(idx, "description", e.target.value)}
                        placeholder="Grand prize winner receives..."
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Schedule Section */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Schedule
                </Typography>
                <Button startIcon={<AddIcon />} onClick={addScheduleItem} size="small">
                  Add Item
                </Button>
              </Box>
              {formData.customContent.schedule.map((item, idx) => (
                <Box key={idx} sx={{ mb: 3, p: 2, border: "1px solid", borderColor: "grey.300", borderRadius: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Typography variant="subtitle2">Schedule Item {idx + 1}</Typography>
                    <IconButton size="small" onClick={() => removeScheduleItem(idx)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <TextField
                        fullWidth
                        label="Time"
                        value={item.time}
                        onChange={(e) => updateScheduleItem(idx, "time", e.target.value)}
                        placeholder="9:00 AM"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 9 }}>
                      <TextField
                        fullWidth
                        label="Title"
                        value={item.title}
                        onChange={(e) => updateScheduleItem(idx, "title", e.target.value)}
                        placeholder="Opening Ceremony"
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Description"
                        value={item.description}
                        onChange={(e) => updateScheduleItem(idx, "description", e.target.value)}
                        placeholder="Optional description..."
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* FAQ Section */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  FAQ
                </Typography>
                <Button startIcon={<AddIcon />} onClick={addFAQ} size="small">
                  Add FAQ
                </Button>
              </Box>
              {formData.customContent.faq.map((item, idx) => (
                <Box key={idx} sx={{ mb: 3, p: 2, border: "1px solid", borderColor: "grey.300", borderRadius: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Typography variant="subtitle2">FAQ {idx + 1}</Typography>
                    <IconButton size="small" onClick={() => removeFAQ(idx)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Question"
                        value={item.question}
                        onChange={(e) => updateFAQ(idx, "question", e.target.value)}
                        placeholder="Who can participate?"
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Answer"
                        value={item.answer}
                        onChange={(e) => updateFAQ(idx, "answer", e.target.value)}
                        placeholder="Anyone 18+ with programming experience..."
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
