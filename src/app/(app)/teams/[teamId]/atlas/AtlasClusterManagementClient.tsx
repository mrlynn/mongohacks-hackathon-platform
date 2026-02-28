'use client';

import { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Breadcrumbs, Link } from '@mui/material';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import ClusterDashboard from '@/components/atlas/ClusterDashboard';
import ProvisionClusterDialog from '@/components/atlas/ProvisionClusterDialog';
import DatabaseUserManager from '@/components/atlas/DatabaseUserManager';
import IpAccessManager from '@/components/atlas/IpAccessManager';

interface AtlasClusterManagementClientProps {
  teamId: string;
  eventId: string;
  projectId: string;
  teamName: string;
  eventName: string;
  isTeamLeader: boolean;
  allowedProviders: string[];
}

export default function AtlasClusterManagementClient({
  teamId,
  eventId,
  projectId,
  teamName,
  eventName,
  isTeamLeader,
  allowedProviders,
}: AtlasClusterManagementClientProps) {
  const [provisionDialogOpen, setProvisionDialogOpen] = useState(false);
  const [clusterId, setClusterId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch cluster to get ID
  useEffect(() => {
    const fetchCluster = async () => {
      try {
        const res = await fetch(`/api/atlas/clusters?teamId=${teamId}`);
        const data = await res.json();
        if (data.clusters?.[0]?._id) {
          setClusterId(data.clusters[0]._id);
        }
      } catch (err) {
        console.error('Failed to fetch cluster:', err);
      }
    };
    fetchCluster();
  }, [teamId, refreshKey]);

  const handleProvisionSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link underline="hover" color="inherit" href="/">
          Home
        </Link>
        <Link underline="hover" color="inherit" href={`/events/${eventId}`}>
          {eventName}
        </Link>
        <Link underline="hover" color="inherit" href={`/teams/${teamId}`}>
          {teamName}
        </Link>
        <Typography color="text.primary">Atlas Cluster</Typography>
      </Breadcrumbs>

      {/* Page Title */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          MongoDB Atlas Cluster
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Free M0 database cluster for {teamName}
        </Typography>
      </Box>

      {/* Cluster Dashboard */}
      <Box sx={{ mb: 4 }}>
        <ClusterDashboard
          teamId={teamId}
          eventId={eventId}
          onProvisionClick={() => setProvisionDialogOpen(true)}
          isTeamLeader={isTeamLeader}
        />
      </Box>

      {/* Database Users & IP Access (only shown if cluster exists) */}
      {clusterId && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <DatabaseUserManager clusterId={clusterId} isTeamLeader={isTeamLeader} />
          </Grid>
          <Grid item xs={12} md={6}>
            <IpAccessManager clusterId={clusterId} isTeamLeader={isTeamLeader} />
          </Grid>
        </Grid>
      )}

      {/* Provision Dialog */}
      <ProvisionClusterDialog
        open={provisionDialogOpen}
        onClose={() => setProvisionDialogOpen(false)}
        teamId={teamId}
        projectId={projectId}
        allowedProviders={allowedProviders}
        onSuccess={handleProvisionSuccess}
      />
    </Container>
  );
}
