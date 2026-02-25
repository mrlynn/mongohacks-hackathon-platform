import { Box, Typography, Paper, Card, CardContent, Divider } from "@mui/material";

export default function AdminSettingsPage() {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure platform settings and preferences
        </Typography>
      </Box>

      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Platform Configuration
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Settings page coming soon. Configure email notifications, judging
            rubrics, and more.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
