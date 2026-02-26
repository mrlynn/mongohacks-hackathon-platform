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
  ListSubheader,
  Paper,
  Tooltip,
} from "@mui/material";
import {
  Save as SaveIcon,
  Preview as PreviewIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ContentCopy as CopyIcon,
  Link as LinkIcon,
  Handshake as HandshakeIcon,
  CheckCircle as CheckIcon,
  HideImage as NoneIcon,
} from "@mui/icons-material";
import Image from "next/image";

const BACKGROUNDS = [
  { file: "collaboration.jpg", label: "Collaboration" },
  { file: "corporate.jpg",     label: "Corporate" },
  { file: "fishbowl.jpg",      label: "Fishbowl" },
  { file: "hackathon.jpg",     label: "Hackathon" },
  { file: "illustrated.jpg",   label: "Illustrated" },
  { file: "startup-office.jpg",label: "Startup Office" },
  { file: "teamwork.jpg",      label: "Teamwork" },
];
import { useRouter } from "next/navigation";
import Link from "next/link";

interface TemplateOption {
  _id: string;
  name: string;
  slug: string;
  description: string;
  isBuiltIn: boolean;
}

interface EventPartner {
  _id: string;
  name: string;
  tier: string;
  logo?: string;
}

interface LandingPageFormData {
  template: string;
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
  const [templateOptions, setTemplateOptions] = useState<TemplateOption[]>([]);
  const [eventPartners, setEventPartners] = useState<EventPartner[]>([]);

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
      faq: [],
    },
  });

  useEffect(() => {
    params.then((p) => {
      setEventId(p.eventId);
      fetchEvent(p.eventId);
    });
    // Fetch available templates
    fetch("/api/admin/templates")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setTemplateOptions(data.templates);
      })
      .catch(() => {});
  }, []);

  const fetchEvent = async (id: string) => {
    try {
      console.log('Fetching event:', id);
      const res = await fetch(`/api/admin/events/${id}`);
      const data = await res.json();
      
      console.log('Event fetch response:', { status: res.status, data });
      
      if (res.ok && data.event) {
        setEventName(data.event.name);

        // Load partners linked to this event
        if (data.event.partners && Array.isArray(data.event.partners)) {
          setEventPartners(data.event.partners);
        }

        // Load existing landing page if exists
        if (data.event.landingPage) {
          console.log('Loading existing landing page:', data.event.landingPage);
          const { sponsors: _sponsors, ...restContent } = data.event.landingPage.customContent || {};
          setFormData({
            template: data.event.landingPage.template || "modern",
            slug: data.event.landingPage.slug || "",
            published: data.event.landingPage.published || false,
            customContent: { ...formData.customContent, ...restContent },
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
        if (publish) {
          setFormData((prev) => ({ ...prev, published: true }));
          const baseUrl = window.location.origin;
          setSuccess(`published:${baseUrl}/${formData.slug}`);
        } else {
          setSuccess("Landing page saved!");
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

  const handleUnpublish = async () => {
    if (!eventId) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/admin/events/${eventId}/landing-page`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, published: false }),
      });
      if (res.ok) {
        setFormData((prev) => ({ ...prev, published: false }));
        setSuccess("Landing page unpublished.");
      } else {
        const data = await res.json();
        setError(data.message || "Failed to unpublish");
      }
    } catch (err) {
      setError("Failed to unpublish: " + String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleCopyUrl = () => {
    const url = `${window.location.origin}/${formData.slug}`;
    navigator.clipboard.writeText(url);
    setSuccess("URL copied to clipboard!");
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
          {formData.published ? (
            <Button
              variant="outlined"
              color="warning"
              startIcon={<VisibilityOffIcon />}
              onClick={handleUnpublish}
              disabled={saving}
            >
              Unpublish
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={() => handleSave(true)}
              disabled={saving || !formData.slug}
            >
              Publish
            </Button>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && success.startsWith("published:") ? (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          onClose={() => setSuccess("")}
          icon={<LinkIcon />}
        >
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
              Your landing page is live!
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                component="a"
                href={success.replace("published:", "")}
                target="_blank"
                sx={{
                  color: "success.dark",
                  fontWeight: 600,
                  wordBreak: "break-all",
                }}
              >
                {success.replace("published:", "")}
              </Box>
              <IconButton size="small" onClick={handleCopyUrl} title="Copy URL">
                <CopyIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Alert>
      ) : success ? (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      ) : null}

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
                  {templateOptions.length > 0 ? [
                    ...(templateOptions.filter((t) => t.isBuiltIn).length > 0
                      ? [<ListSubheader key="built-in-header">Built-in Templates</ListSubheader>]
                      : []),
                    ...templateOptions.filter((t) => t.isBuiltIn).map((t) => (
                      <MenuItem key={t.slug} value={t.slug}>{t.name} - {t.description?.slice(0, 50)}</MenuItem>
                    )),
                    ...(templateOptions.filter((t) => !t.isBuiltIn).length > 0
                      ? [<ListSubheader key="custom-header">Custom Templates</ListSubheader>]
                      : []),
                    ...templateOptions.filter((t) => !t.isBuiltIn).map((t) => (
                      <MenuItem key={t.slug} value={t.slug}>{t.name}</MenuItem>
                    )),
                  ] : [
                    <MenuItem key="modern" value="modern">Modern - Clean &amp; Professional</MenuItem>,
                    <MenuItem key="bold" value="bold">Bold - Vibrant &amp; Energetic</MenuItem>,
                    <MenuItem key="tech" value="tech">Tech - Dark &amp; Futuristic</MenuItem>,
                    <MenuItem key="leafy" value="leafy">Leafy - Official MongoDB Style</MenuItem>,
                    <MenuItem key="atlas" value="atlas">Atlas - Dark Dashboard Aesthetic</MenuItem>,
                    <MenuItem key="community" value="community">Community - Warm &amp; Inclusive</MenuItem>,
                  ]}
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
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Hero Background Image
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                    Choose a pre-loaded background or enter a custom URL below.
                    The image will be displayed behind the hero content with a color overlay from your template.
                  </Typography>
                  <Grid container spacing={1.5} sx={{ mb: 2 }}>
                    {/* None option */}
                    <Grid size={{ xs: 6, sm: 3, md: 2 }}>
                      <Tooltip title="No background image — use template gradient/color">
                        <Paper
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              customContent: {
                                ...prev.customContent,
                                hero: { ...prev.customContent.hero, backgroundImage: "" },
                              },
                            }))
                          }
                          elevation={!(formData.customContent.hero.backgroundImage ?? "") ? 4 : 1}
                          sx={{
                            cursor: "pointer",
                            borderRadius: 2,
                            overflow: "hidden",
                            border: 2,
                            borderColor: !(formData.customContent.hero.backgroundImage ?? "")
                              ? "primary.main"
                              : "divider",
                            transition: "all 0.15s",
                            "&:hover": { borderColor: "primary.main", transform: "translateY(-2px)" },
                            position: "relative",
                          }}
                        >
                          <Box
                            sx={{
                              height: 72,
                              bgcolor: "background.default",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <NoneIcon sx={{ fontSize: 28, color: "text.disabled" }} />
                          </Box>
                          <Box sx={{ p: 0.75, textAlign: "center" }}>
                            <Typography variant="caption" fontWeight={600}>None</Typography>
                          </Box>
                          {!(formData.customContent.hero.backgroundImage ?? "") && (
                            <CheckIcon
                              sx={{
                                position: "absolute", top: 5, right: 5,
                                color: "primary.main", fontSize: 18,
                                bgcolor: "background.paper", borderRadius: "50%",
                              }}
                            />
                          )}
                        </Paper>
                      </Tooltip>
                    </Grid>

                    {BACKGROUNDS.map(({ file, label }) => {
                      const val = `/backgrounds/${file}`;
                      const isSelected = (formData.customContent.hero.backgroundImage ?? "") === val;
                      return (
                        <Grid key={file} size={{ xs: 6, sm: 3, md: 2 }}>
                          <Paper
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                customContent: {
                                  ...prev.customContent,
                                  hero: { ...prev.customContent.hero, backgroundImage: val },
                                },
                              }))
                            }
                            elevation={isSelected ? 4 : 1}
                            sx={{
                              cursor: "pointer",
                              borderRadius: 2,
                              overflow: "hidden",
                              border: 2,
                              borderColor: isSelected ? "primary.main" : "divider",
                              transition: "all 0.15s",
                              "&:hover": { borderColor: "primary.main", transform: "translateY(-2px)" },
                              position: "relative",
                            }}
                          >
                            <Box sx={{ height: 72, position: "relative" }}>
                              <Image
                                src={val}
                                alt={label}
                                fill
                                style={{ objectFit: "cover" }}
                                sizes="160px"
                              />
                            </Box>
                            <Box sx={{ p: 0.75, textAlign: "center" }}>
                              <Typography variant="caption" fontWeight={600}>{label}</Typography>
                            </Box>
                            {isSelected && (
                              <CheckIcon
                                sx={{
                                  position: "absolute", top: 5, right: 5,
                                  color: "primary.main", fontSize: 18,
                                  bgcolor: "background.paper", borderRadius: "50%",
                                }}
                              />
                            )}
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>

                  <TextField
                    fullWidth
                    size="small"
                    label="Or enter a custom image URL"
                    value={
                      (formData.customContent.hero.backgroundImage ?? "").startsWith("/backgrounds/")
                        ? ""
                        : (formData.customContent.hero.backgroundImage ?? "")
                    }
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        customContent: {
                          ...prev.customContent,
                          hero: { ...prev.customContent.hero, backgroundImage: e.target.value },
                        },
                      }))
                    }
                    placeholder="https://example.com/image.jpg"
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

        {/* Partners Section (read-only) */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <HandshakeIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Partners
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  component={Link}
                  href={`/admin/events/${eventId}/edit`}
                >
                  Manage Partners
                </Button>
              </Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                Partners are automatically displayed on the landing page based on the partners linked to this event.
                Use the event editor to add or remove partners.
              </Alert>
              {eventPartners.length > 0 ? (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {eventPartners.map((partner) => (
                    <Chip
                      key={partner._id}
                      label={`${partner.name} (${partner.tier})`}
                      variant="outlined"
                      color="primary"
                      avatar={partner.logo ? (
                        <Box
                          component="img"
                          src={partner.logo}
                          alt={partner.name}
                          sx={{ width: 24, height: 24, borderRadius: "50%", objectFit: "contain" }}
                        />
                      ) : undefined}
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No partners linked to this event yet. Add partners from the event editor.
                </Typography>
              )}
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
