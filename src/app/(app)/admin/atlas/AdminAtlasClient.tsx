'use client';

import { Container, Typography, Box, Breadcrumbs, Link, Grid } from '@mui/material';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import AdminClusterOverview from '@/components/atlas/admin/AdminClusterOverview';
import CleanupControls from '@/components/atlas/admin/CleanupControls';

export default function AdminAtlasClient() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 3 }}>
        <Link href="/dashboard" underline="hover" color="inherit">
          Dashboard
        </Link>
        <Link href="/admin" underline="hover" color="inherit">
          Admin
        </Link>
        <Typography color="text.primary">Atlas Clusters</Typography>
      </Breadcrumbs>

      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Atlas Cluster Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Overview and management of all provisioned MongoDB Atlas clusters
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Cleanup Controls */}
        <Grid item xs={12}>
          <CleanupControls />
        </Grid>

        {/* Cluster Overview */}
        <Grid item xs={12}>
          <AdminClusterOverview />
        </Grid>
      </Grid>
    </Container>
  );
}
