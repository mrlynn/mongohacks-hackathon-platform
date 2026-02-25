"use client";

import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import GroupsIcon from "@mui/icons-material/Groups";
import AssignmentIcon from "@mui/icons-material/Assignment";

export default function DashboardPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Dashboard
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Welcome back! Here is an overview of your hackathon activity.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <EventIcon sx={{ fontSize: 40, color: "primary.main" }} />
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    0
                  </Typography>
                  <Typography color="text.secondary">
                    Registered Events
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <GroupsIcon sx={{ fontSize: 40, color: "secondary.main" }} />
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    0
                  </Typography>
                  <Typography color="text.secondary">Teams</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <AssignmentIcon sx={{ fontSize: 40, color: "success.main" }} />
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    0
                  </Typography>
                  <Typography color="text.secondary">Projects</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <Typography color="text.secondary">
            No recent activity. Register for a hackathon to get started!
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}
