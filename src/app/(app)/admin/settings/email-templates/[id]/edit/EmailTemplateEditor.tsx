"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Grid,
  Divider,
  Chip,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
  Send as SendIcon,
} from "@mui/icons-material";

interface TemplateVariable {
  name: string;
  required: boolean;
  description: string;
  example: string;
}

interface EmailTemplate {
  _id: string;
  key: string;
  name: string;
  category: string;
  description: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  variables: TemplateVariable[];
  isBuiltIn: boolean;
  updatedBy?: { name: string };
  updatedAt: string;
}

export default function EmailTemplateEditor({ templateId }: { templateId: string }) {
  const router = useRouter();
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Editable fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [htmlBody, setHtmlBody] = useState("");
  const [textBody, setTextBody] = useState("");

  // Preview
  const [previewMode, setPreviewMode] = useState<"html" | "text">("html");
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [previewSubject, setPreviewSubject] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

  // Test send
  const [testSendDialog, setTestSendDialog] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);

  const fetchTemplate = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/email-templates/${templateId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load template");
      const t = data.template;
      setTemplate(t);
      setName(t.name);
      setDescription(t.description);
      setSubject(t.subject);
      setHtmlBody(t.htmlBody);
      setTextBody(t.textBody);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load template");
    } finally {
      setLoading(false);
    }
  }, [templateId]);

  useEffect(() => {
    fetchTemplate();
  }, [fetchTemplate]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/email-templates/${templateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, subject, htmlBody, textBody }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setSuccess("Template saved successfully");
      setTemplate(data.template);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    setPreviewLoading(true);
    try {
      const res = await fetch(`/api/admin/email-templates/${templateId}/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variables: {} }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Preview failed");
      setPreviewSubject(data.subject);
      setPreviewHtml(data.html);
      setPreviewText(data.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Preview failed");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleTestSend = async () => {
    setSendingTest(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/email-templates/${templateId}/test-send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toEmail: testEmail || undefined, variables: {} }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Test send failed");
      setSuccess(`Test email sent to ${data.sentTo}`);
      setTestSendDialog(false);
      setTestEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Test send failed");
    } finally {
      setSendingTest(false);
    }
  };

  const insertVariable = (varName: string, field: "subject" | "htmlBody" | "textBody") => {
    const placeholder = `{{${varName}}}`;
    if (field === "subject") setSubject((prev) => prev + placeholder);
    else if (field === "htmlBody") setHtmlBody((prev) => prev + placeholder);
    else setTextBody((prev) => prev + placeholder);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!template) {
    return <Alert severity="error">Template not found</Alert>;
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Button startIcon={<BackIcon />} onClick={() => router.push("/admin/settings/email-templates")}>
          Back
        </Button>
        <Typography variant="h5" fontWeight={700} sx={{ flex: 1 }}>
          Edit: {template.name}
        </Typography>
        <Chip label={template.category} size="small" color="primary" />
        {template.isBuiltIn && <Chip label="Built-in" size="small" variant="outlined" />}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* Left: Editor */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Template Details
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Key"
                    value={template.key}
                    disabled
                    fullWidth
                    helperText="Template key cannot be changed"
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Subject Line
              </Typography>
              <TextField
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                fullWidth
                placeholder="Email subject with {{variables}}"
              />
              <Box sx={{ mt: 1, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                {template.variables.map((v) => (
                  <Chip
                    key={v.name}
                    label={`{{${v.name}}}`}
                    size="small"
                    variant="outlined"
                    onClick={() => insertVariable(v.name, "subject")}
                    sx={{ cursor: "pointer", fontFamily: "monospace", fontSize: "0.75rem" }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                HTML Body
              </Typography>
              <TextField
                value={htmlBody}
                onChange={(e) => setHtmlBody(e.target.value)}
                multiline
                rows={16}
                fullWidth
                slotProps={{ input: { sx: { fontFamily: "monospace", fontSize: "0.85rem" } } }}
              />
              <Box sx={{ mt: 1, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                {template.variables.map((v) => (
                  <Chip
                    key={v.name}
                    label={`{{${v.name}}}`}
                    size="small"
                    variant="outlined"
                    onClick={() => insertVariable(v.name, "htmlBody")}
                    sx={{ cursor: "pointer", fontFamily: "monospace", fontSize: "0.75rem" }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Plain Text Body
              </Typography>
              <TextField
                value={textBody}
                onChange={(e) => setTextBody(e.target.value)}
                multiline
                rows={8}
                fullWidth
                slotProps={{ input: { sx: { fontFamily: "monospace", fontSize: "0.85rem" } } }}
              />
              <Box sx={{ mt: 1, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                {template.variables.map((v) => (
                  <Chip
                    key={v.name}
                    label={`{{${v.name}}}`}
                    size="small"
                    variant="outlined"
                    onClick={() => insertVariable(v.name, "textBody")}
                    sx={{ cursor: "pointer", fontFamily: "monospace", fontSize: "0.75rem" }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving}
              size="large"
            >
              {saving ? "Saving..." : "Save Template"}
            </Button>
            <Button
              variant="outlined"
              startIcon={<PreviewIcon />}
              onClick={handlePreview}
              disabled={previewLoading}
            >
              {previewLoading ? "Loading..." : "Refresh Preview"}
            </Button>
            <Button
              variant="outlined"
              startIcon={<SendIcon />}
              onClick={() => setTestSendDialog(true)}
            >
              Send Test Email
            </Button>
          </Box>
        </Grid>

        {/* Right: Preview + Variables */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Preview
                </Typography>
                <ToggleButtonGroup
                  value={previewMode}
                  exclusive
                  onChange={(_e, val) => val && setPreviewMode(val)}
                  size="small"
                >
                  <ToggleButton value="html">HTML</ToggleButton>
                  <ToggleButton value="text">Text</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {previewSubject && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Subject:</strong> {previewSubject}
                </Typography>
              )}

              <Divider sx={{ mb: 2 }} />

              {previewHtml || previewText ? (
                previewMode === "html" ? (
                  <Box
                    sx={{
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                      p: 1,
                      maxHeight: 600,
                      overflow: "auto",
                      bgcolor: "background.default",
                    }}
                  >
                    <iframe
                      srcDoc={previewHtml}
                      style={{ width: "100%", minHeight: 500, border: "none" }}
                      title="Email Preview"
                      sandbox=""
                    />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                      p: 2,
                      fontFamily: "monospace",
                      fontSize: "0.85rem",
                      whiteSpace: "pre-wrap",
                      maxHeight: 600,
                      overflow: "auto",
                      bgcolor: "background.default",
                    }}
                  >
                    {previewText}
                  </Box>
                )
              ) : (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography color="text.secondary" variant="body2">
                    Click &quot;Refresh Preview&quot; to see rendered output
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Available Variables
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Variable</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Example</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {template.variables.map((v) => (
                      <TableRow key={v.name}>
                        <TableCell>
                          <Typography fontFamily="monospace" fontSize="0.8rem">
                            {`{{${v.name}}}`}
                          </Typography>
                          {v.required && (
                            <Chip label="required" size="small" color="error" sx={{ ml: 0.5, height: 18, fontSize: "0.65rem" }} />
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">{v.description}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {v.example}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Test Send Dialog */}
      <Dialog open={testSendDialog} onClose={() => setTestSendDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Test Email</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Send a test email with example variable values. Leave blank to send to your own email.
          </Typography>
          <TextField
            label="Recipient Email (optional)"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            type="email"
            fullWidth
            placeholder="Leave blank to send to yourself"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestSendDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleTestSend}
            disabled={sendingTest}
            startIcon={<SendIcon />}
          >
            {sendingTest ? "Sending..." : "Send Test"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess("")}
        message={success}
      />
    </Box>
  );
}
