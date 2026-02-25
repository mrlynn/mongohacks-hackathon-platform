"use client";

import { useState, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Stack,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Slider,
  Paper,
  IconButton,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  Save as SaveIcon,
  ArrowBack as BackIcon,
  ContentCopy as CopyIcon,
  DragIndicator as DragIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import DynamicTemplate from "@/components/landing-pages/DynamicTemplate";

interface TemplateConfig {
  _id: string;
  name: string;
  slug: string;
  description: string;
  isBuiltIn: boolean;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    heroBg: string;
    heroBgEnd: string;
    heroText: string;
    buttonBg: string;
    buttonText: string;
  };
  typography: {
    headingFont: "system" | "serif" | "mono";
    bodyFont: "system" | "serif" | "mono";
    headingWeight: 600 | 700 | 800 | 900;
    scale: "compact" | "default" | "large";
  };
  sections: Array<{
    type: "hero" | "about" | "prizes" | "schedule" | "sponsors" | "faq" | "cta";
    enabled: boolean;
    layout: string;
    style: {
      bgStyle: "light" | "dark" | "primary" | "gradient";
      spacing: "compact" | "default" | "spacious";
    };
  }>;
  cards: {
    borderRadius: 0 | 8 | 12 | 16;
    style: "shadow" | "border" | "flat" | "glass";
    accentPosition: "top" | "left" | "none";
  };
  hero: {
    style: "gradient" | "solid" | "image-overlay" | "light";
    gradientDirection: string;
    overlayOpacity: number;
    buttonStyle: "rounded" | "pill" | "square";
  };
}

// Sample event data for preview
const sampleEvent = {
  name: "MongoDB Hackathon 2026",
  description: "Build the next generation of database-powered applications. Join developers from around the world for an unforgettable 48-hour coding experience.",
  startDate: "2026-06-15T09:00:00Z",
  endDate: "2026-06-17T18:00:00Z",
  location: "San Francisco, CA",
  landingPage: {
    customContent: {
      hero: {
        headline: "MongoDB Hackathon 2026",
        subheadline: "Build the future of data-driven applications",
        ctaText: "Register Now",
      },
      about: "Join us for an incredible 48-hour hackathon where developers, designers, and innovators come together to build the next generation of data-powered applications. Whether you're a seasoned pro or just starting out, this event is for you!",
      prizes: [
        { title: "1st Place", description: "Grand Prize Winner", value: "$5,000" },
        { title: "2nd Place", description: "Runner Up", value: "$2,500" },
        { title: "3rd Place", description: "Third Place", value: "$1,000" },
      ],
      schedule: [
        { time: "9:00 AM", title: "Opening Ceremony", description: "Welcome and team formation" },
        { time: "10:00 AM", title: "Hacking Begins", description: "Start building your projects" },
        { time: "12:00 PM", title: "Lunch Break", description: "Refuel and network" },
        { time: "6:00 PM", title: "Submissions Due", description: "Final project submissions" },
        { time: "7:00 PM", title: "Awards Ceremony", description: "Winner announcements" },
      ],
      sponsors: [
        { name: "MongoDB", logo: "/mongodb-logo.svg", tier: "Gold" },
        { name: "Vercel", logo: "/vercel-logo.svg", tier: "Silver" },
        { name: "GitHub", logo: "/github-logo.svg", tier: "Silver" },
      ],
      faq: [
        { question: "Who can participate?", answer: "Anyone with a passion for coding! All skill levels are welcome." },
        { question: "Do I need a team?", answer: "You can join solo or form teams of up to 5. We'll help match solo participants with teams." },
        { question: "What should I bring?", answer: "Your laptop, charger, and creativity! Food and drinks will be provided." },
      ],
    },
  },
};

export default function TemplateEditor({ initialConfig }: { initialConfig: TemplateConfig }) {
  const router = useRouter();
  const [config, setConfig] = useState<TemplateConfig>(initialConfig);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
  const [activeTab, setActiveTab] = useState(0);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [templateName, setTemplateName] = useState(config.name);

  const updateConfig = useCallback((path: string, value: any) => {
    setConfig((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let obj = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return updated;
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { _id, isBuiltIn, slug, ...updateData } = config;
      const res = await fetch(`/api/admin/templates/${_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...updateData, name: templateName }),
      });
      const data = await res.json();
      if (data.success) {
        setSnackbar({ open: true, message: "Template saved!", severity: "success" });
      } else {
        setSnackbar({ open: true, message: data.error || "Save failed", severity: "error" });
      }
    } catch {
      setSnackbar({ open: true, message: "Failed to save", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAsCopy = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/templates/${config._id}/clone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `${templateName} (Copy)`, slug: `${config.slug}-copy` }),
      });
      const data = await res.json();
      if (data.success) {
        setSnackbar({ open: true, message: "Saved as copy!", severity: "success" });
        router.push(`/admin/settings/templates/${data.template._id}/edit`);
      } else {
        setSnackbar({ open: true, message: data.error, severity: "error" });
      }
    } catch {
      setSnackbar({ open: true, message: "Failed to save copy", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const newSections = [...config.sections];
    const swap = direction === "up" ? index - 1 : index + 1;
    if (swap < 0 || swap >= newSections.length) return;
    [newSections[index], newSections[swap]] = [newSections[swap], newSections[index]];
    setConfig((prev) => ({ ...prev, sections: newSections }));
    if (selectedSection === index) setSelectedSection(swap);
    else if (selectedSection === swap) setSelectedSection(index);
  };

  const colorFields = [
    { key: "primary", label: "Primary" },
    { key: "secondary", label: "Secondary" },
    { key: "background", label: "Background" },
    { key: "surface", label: "Surface" },
    { key: "text", label: "Text" },
    { key: "textSecondary", label: "Text Secondary" },
    { key: "heroBg", label: "Hero BG Start" },
    { key: "heroBgEnd", label: "Hero BG End" },
    { key: "heroText", label: "Hero Text" },
    { key: "buttonBg", label: "Button BG" },
    { key: "buttonText", label: "Button Text" },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", mx: -3, mt: -3 }}>
      {/* Top Bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          px: 2,
          py: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <IconButton onClick={() => router.push("/admin/settings/templates")} size="small">
          <BackIcon />
        </IconButton>
        <TextField
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          variant="standard"
          sx={{ "& input": { fontSize: "1.25rem", fontWeight: 600 } }}
        />
        {config.isBuiltIn && <Chip label="Built-in" size="small" color="info" />}
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="outlined"
          startIcon={<CopyIcon />}
          onClick={handleSaveAsCopy}
          disabled={saving}
          size="small"
        >
          Save as Copy
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
          size="small"
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </Box>

      {/* Three-panel layout */}
      <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
        {/* Left Panel — Section Manager */}
        <Box
          sx={{
            width: 240,
            borderRight: "1px solid",
            borderColor: "divider",
            overflow: "auto",
            bgcolor: "background.paper",
            p: 2,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, textTransform: "uppercase", letterSpacing: 0.5, fontSize: "0.75rem", color: "text.secondary" }}>
            Sections
          </Typography>
          <Stack spacing={1}>
            {config.sections.map((section, i) => (
              <Paper
                key={`${section.type}-${i}`}
                elevation={selectedSection === i ? 3 : 0}
                sx={{
                  p: 1.5,
                  cursor: "pointer",
                  border: "1px solid",
                  borderColor: selectedSection === i ? "primary.main" : "divider",
                  borderRadius: 1,
                  bgcolor: selectedSection === i ? "primary.50" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  "&:hover": { borderColor: "primary.light" },
                }}
                onClick={() => setSelectedSection(i)}
              >
                <DragIcon sx={{ fontSize: 18, color: "text.disabled", cursor: "grab" }} />
                <Typography variant="body2" sx={{ fontWeight: 500, flexGrow: 1, textTransform: "capitalize" }}>
                  {section.type}
                </Typography>
                <Tooltip title={section.enabled ? "Visible" : "Hidden"}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      const newSections = [...config.sections];
                      newSections[i] = { ...newSections[i], enabled: !newSections[i].enabled };
                      setConfig((prev) => ({ ...prev, sections: newSections }));
                    }}
                    sx={{ p: 0.5 }}
                  >
                    {section.enabled ? (
                      <VisibilityIcon sx={{ fontSize: 16 }} />
                    ) : (
                      <VisibilityOffIcon sx={{ fontSize: 16, color: "text.disabled" }} />
                    )}
                  </IconButton>
                </Tooltip>
              </Paper>
            ))}
          </Stack>

          {selectedSection !== null && (
            <Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: "center" }}>
              <Button size="small" variant="outlined" onClick={() => moveSection(selectedSection, "up")} disabled={selectedSection === 0}>
                Move Up
              </Button>
              <Button size="small" variant="outlined" onClick={() => moveSection(selectedSection, "down")} disabled={selectedSection === config.sections.length - 1}>
                Move Down
              </Button>
            </Stack>
          )}
        </Box>

        {/* Center Panel — Live Preview */}
        <Box
          sx={{
            flexGrow: 1,
            overflow: "auto",
            bgcolor: "#f0f0f0",
            position: "relative",
          }}
        >
          <Box
            sx={{
              transform: "scale(0.55)",
              transformOrigin: "top center",
              width: "182%",
              mt: 2,
            }}
          >
            <DynamicTemplate config={config as any} event={sampleEvent} />
          </Box>
        </Box>

        {/* Right Panel — Property Editor */}
        <Box
          sx={{
            width: 320,
            borderLeft: "1px solid",
            borderColor: "divider",
            overflow: "auto",
            bgcolor: "background.paper",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: "1px solid", borderColor: "divider", minHeight: 42 }}
          >
            <Tab label="Colors" sx={{ minHeight: 42, textTransform: "none", fontSize: "0.85rem" }} />
            <Tab label="Typography" sx={{ minHeight: 42, textTransform: "none", fontSize: "0.85rem" }} />
            <Tab label="Hero" sx={{ minHeight: 42, textTransform: "none", fontSize: "0.85rem" }} />
            <Tab label="Cards" sx={{ minHeight: 42, textTransform: "none", fontSize: "0.85rem" }} />
            {selectedSection !== null && (
              <Tab label="Section" sx={{ minHeight: 42, textTransform: "none", fontSize: "0.85rem" }} />
            )}
          </Tabs>

          <Box sx={{ p: 2, overflow: "auto", flexGrow: 1 }}>
            {/* Colors Tab */}
            {activeTab === 0 && (
              <Stack spacing={2}>
                {colorFields.map(({ key, label }) => (
                  <Box key={key} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      component="input"
                      type="color"
                      value={(config.colors as any)[key]}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateConfig(`colors.${key}`, e.target.value)}
                      sx={{
                        width: 36,
                        height: 36,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                        cursor: "pointer",
                        p: 0,
                        "&::-webkit-color-swatch-wrapper": { p: "2px" },
                        "&::-webkit-color-swatch": { borderRadius: "4px", border: "none" },
                      }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, display: "block", lineHeight: 1.2 }}>
                        {label}
                      </Typography>
                      <TextField
                        value={(config.colors as any)[key]}
                        onChange={(e) => updateConfig(`colors.${key}`, e.target.value)}
                        size="small"
                        variant="standard"
                        sx={{ "& input": { fontSize: "0.75rem", fontFamily: "monospace" } }}
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}

            {/* Typography Tab */}
            {activeTab === 1 && (
              <Stack spacing={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Heading Font</InputLabel>
                  <Select
                    value={config.typography.headingFont}
                    label="Heading Font"
                    onChange={(e) => updateConfig("typography.headingFont", e.target.value)}
                  >
                    <MenuItem value="system">System (Sans-serif)</MenuItem>
                    <MenuItem value="serif">Serif (Georgia)</MenuItem>
                    <MenuItem value="mono">Monospace (Courier)</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel>Body Font</InputLabel>
                  <Select
                    value={config.typography.bodyFont}
                    label="Body Font"
                    onChange={(e) => updateConfig("typography.bodyFont", e.target.value)}
                  >
                    <MenuItem value="system">System (Sans-serif)</MenuItem>
                    <MenuItem value="serif">Serif (Georgia)</MenuItem>
                    <MenuItem value="mono">Monospace (Courier)</MenuItem>
                  </Select>
                </FormControl>

                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: "block" }}>
                    Heading Weight: {config.typography.headingWeight}
                  </Typography>
                  <Slider
                    value={config.typography.headingWeight}
                    onChange={(_, v) => updateConfig("typography.headingWeight", v)}
                    min={600}
                    max={900}
                    step={100}
                    marks={[
                      { value: 600, label: "600" },
                      { value: 700, label: "700" },
                      { value: 800, label: "800" },
                      { value: 900, label: "900" },
                    ]}
                  />
                </Box>

                <FormControl fullWidth size="small">
                  <InputLabel>Scale</InputLabel>
                  <Select
                    value={config.typography.scale}
                    label="Scale"
                    onChange={(e) => updateConfig("typography.scale", e.target.value)}
                  >
                    <MenuItem value="compact">Compact</MenuItem>
                    <MenuItem value="default">Default</MenuItem>
                    <MenuItem value="large">Large</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            )}

            {/* Hero Tab */}
            {activeTab === 2 && (
              <Stack spacing={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Hero Style</InputLabel>
                  <Select
                    value={config.hero.style}
                    label="Hero Style"
                    onChange={(e) => updateConfig("hero.style", e.target.value)}
                  >
                    <MenuItem value="gradient">Gradient</MenuItem>
                    <MenuItem value="solid">Solid Color</MenuItem>
                    <MenuItem value="image-overlay">Image Overlay</MenuItem>
                    <MenuItem value="light">Light</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Gradient Direction"
                  value={config.hero.gradientDirection}
                  onChange={(e) => updateConfig("hero.gradientDirection", e.target.value)}
                  size="small"
                  fullWidth
                  helperText="CSS angle (e.g., 135deg, to right)"
                />

                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: "block" }}>
                    Overlay Opacity: {config.hero.overlayOpacity.toFixed(2)}
                  </Typography>
                  <Slider
                    value={config.hero.overlayOpacity}
                    onChange={(_, v) => updateConfig("hero.overlayOpacity", v)}
                    min={0}
                    max={1}
                    step={0.05}
                  />
                </Box>

                <FormControl fullWidth size="small">
                  <InputLabel>Button Style</InputLabel>
                  <Select
                    value={config.hero.buttonStyle}
                    label="Button Style"
                    onChange={(e) => updateConfig("hero.buttonStyle", e.target.value)}
                  >
                    <MenuItem value="rounded">Rounded</MenuItem>
                    <MenuItem value="pill">Pill</MenuItem>
                    <MenuItem value="square">Square</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            )}

            {/* Cards Tab */}
            {activeTab === 3 && (
              <Stack spacing={3}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: "block" }}>
                    Border Radius: {config.cards.borderRadius}px
                  </Typography>
                  <Slider
                    value={config.cards.borderRadius}
                    onChange={(_, v) => updateConfig("cards.borderRadius", v)}
                    min={0}
                    max={16}
                    step={4}
                    marks={[
                      { value: 0, label: "0" },
                      { value: 8, label: "8" },
                      { value: 12, label: "12" },
                      { value: 16, label: "16" },
                    ]}
                  />
                </Box>

                <FormControl fullWidth size="small">
                  <InputLabel>Card Style</InputLabel>
                  <Select
                    value={config.cards.style}
                    label="Card Style"
                    onChange={(e) => updateConfig("cards.style", e.target.value)}
                  >
                    <MenuItem value="shadow">Shadow</MenuItem>
                    <MenuItem value="border">Border</MenuItem>
                    <MenuItem value="flat">Flat</MenuItem>
                    <MenuItem value="glass">Glass</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel>Accent Position</InputLabel>
                  <Select
                    value={config.cards.accentPosition}
                    label="Accent Position"
                    onChange={(e) => updateConfig("cards.accentPosition", e.target.value)}
                  >
                    <MenuItem value="none">None</MenuItem>
                    <MenuItem value="top">Top</MenuItem>
                    <MenuItem value="left">Left</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            )}

            {/* Section Tab */}
            {activeTab === 4 && selectedSection !== null && config.sections[selectedSection] && (
              <Stack spacing={3}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: "capitalize" }}>
                  {config.sections[selectedSection].type} Section
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={config.sections[selectedSection].enabled}
                      onChange={(e) => {
                        const newSections = [...config.sections];
                        newSections[selectedSection] = { ...newSections[selectedSection], enabled: e.target.checked };
                        setConfig((prev) => ({ ...prev, sections: newSections }));
                      }}
                    />
                  }
                  label="Enabled"
                />

                <FormControl fullWidth size="small">
                  <InputLabel>Layout</InputLabel>
                  <Select
                    value={config.sections[selectedSection].layout}
                    label="Layout"
                    onChange={(e) => {
                      const newSections = [...config.sections];
                      newSections[selectedSection] = { ...newSections[selectedSection], layout: e.target.value };
                      setConfig((prev) => ({ ...prev, sections: newSections }));
                    }}
                  >
                    <MenuItem value="default">Default</MenuItem>
                    <MenuItem value="grid-2">Grid (2 columns)</MenuItem>
                    <MenuItem value="grid-3">Grid (3 columns)</MenuItem>
                    <MenuItem value="grid">Grid</MenuItem>
                    <MenuItem value="list">List</MenuItem>
                    <MenuItem value="timeline">Timeline</MenuItem>
                    <MenuItem value="stepper">Stepper</MenuItem>
                    <MenuItem value="accordion">Accordion</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel>Background Style</InputLabel>
                  <Select
                    value={config.sections[selectedSection].style.bgStyle}
                    label="Background Style"
                    onChange={(e) => {
                      const newSections = [...config.sections];
                      newSections[selectedSection] = {
                        ...newSections[selectedSection],
                        style: { ...newSections[selectedSection].style, bgStyle: e.target.value as any },
                      };
                      setConfig((prev) => ({ ...prev, sections: newSections }));
                    }}
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="primary">Primary Color</MenuItem>
                    <MenuItem value="gradient">Gradient</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel>Spacing</InputLabel>
                  <Select
                    value={config.sections[selectedSection].style.spacing}
                    label="Spacing"
                    onChange={(e) => {
                      const newSections = [...config.sections];
                      newSections[selectedSection] = {
                        ...newSections[selectedSection],
                        style: { ...newSections[selectedSection].style, spacing: e.target.value as any },
                      };
                      setConfig((prev) => ({ ...prev, sections: newSections }));
                    }}
                  >
                    <MenuItem value="compact">Compact</MenuItem>
                    <MenuItem value="default">Default</MenuItem>
                    <MenuItem value="spacious">Spacious</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            )}
          </Box>
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
