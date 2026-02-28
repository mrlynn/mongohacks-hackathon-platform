'use client';

import { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Box, Grid, Breadcrumbs, Link } from '@mui/material';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import ClusterDashboard from '@/components/atlas/ClusterDashboard';
import ProvisionClusterDialog from '@/components/atlas/ProvisionClusterDialog';
import DatabaseUserManager from '@/components/atlas/DatabaseUserManager';
import IpAccessManager from '@/components/atlas/IpAccessManager';

interface AtlasClusterManagementClientProps {
  teamId: string;
  eventId: string;
  teamName: string;
  eventName: string;
  isTeamLeader: boolean;
  isAdmin: boolean;
  allowedProviders: string[];
}

export default function AtlasClusterManagementClient({
  teamId,
  eventId,
  teamName,
  eventName,
  isTeamLeader,
  isAdmin,
  allowedProviders,
}: AtlasClusterManagementClientProps) {
  const [provisionDialogOpen, setProvisionDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Admins and team leaders can perform write operations
  const canManage = isTeamLeader || isAdmin;

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

      {/* Cluster Dashboard — single source of truth for cluster state */}
      <ClusterDashboard
        teamId={teamId}
        eventId={eventId}
        onProvisionClick={() => setProvisionDialogOpen(true)}
        isTeamLeader={canManage}
        refreshKey={refreshKey}
      />

      {/* Provision Dialog */}
      <ProvisionClusterDialog
        open={provisionDialogOpen}
        onClose={() => setProvisionDialogOpen(false)}
        teamId={teamId}
        allowedProviders={allowedProviders}
        onSuccess={handleProvisionSuccess}
      />
    </Container>
  );
}
