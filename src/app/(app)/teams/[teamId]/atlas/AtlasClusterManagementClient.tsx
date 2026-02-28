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
}

export default function AtlasClusterManagementClient({
  teamId,
  eventId,
  projectId,
  teamName,
  eventName,
  isTeamLeader,
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 3 }}
      >
        <Link href="/dashboard" underline="hover" color="inherit">
          Dashboard
        </Link>
        <Link href={`/teams/${teamId}`} underline="hover" color="inherit">
          {teamName}
        </Link>
        <Typography color="text.primary">Atlas Cluster</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          MongoDB Atlas Cluster
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your team's database cluster for {eventName}
        </Typography>
      </Box>

      {/* Cluster Dashboard */}
      <Box mb={3}>
        <ClusterDashboard
          key={refreshKey}
          teamId={teamId}
          eventId={eventId}
          isTeamLeader={isTeamLeader}
          onProvisionClick={() => setProvisionDialogOpen(true)}
        />
      </Box>

      {/* Management Sections (only show if cluster exists) */}
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
        onSuccess={handleProvisionSuccess}
      />
    </Container>
  );
}
