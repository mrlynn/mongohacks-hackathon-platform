'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Stack,
  Avatar,
  AvatarGroup,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  People as PeopleIcon,
  PersonAdd as JoinIcon,
  Info as InfoIcon,
  Star as StarIcon,
  TrendingUp as TrendingIcon,
  Code as CodeIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';

interface TeamMember {
  _id: string;
  name: string;
  email?: string;
  avatar?: string;
}

interface RecommendedTeam {
  _id: string;
  name: string;
  description?: string;
  members: TeamMember[];
  leaderId?: TeamMember;
  maxMembers: number;
  lookingForMembers: boolean;
  desiredSkills?: string[];
  requiredSkills?: string[];
  preferredSkills?: string[];
  matchScore?: number;
  matchReasons?: string[];
}

interface BrowseTeamsSectionProps {
  recommendedTeams: RecommendedTeam[];
  eventId: string;
}

export default function BrowseTeamsSection({
  recommendedTeams,
  eventId,
}: BrowseTeamsSectionProps) {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [selectedTeam, setSelectedTeam] = useState<RecommendedTeam | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenTeamDialog = (team: RecommendedTeam) => {
    setSelectedTeam(team);
    setError(null);
  };

  const handleCloseDialog = () => {
    setSelectedTeam(null);
    setError(null);
  };

  const handleJoinTeam = async () => {
    if (!selectedTeam) return;

    setIsJoining(true);
    setError(null);

    try {
      const response = await fetch(`/api/events/${eventId}/teams/${selectedTeam._id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to join team');
      }

      // Success - show toast and refresh
      showSuccess(`Successfully joined ${selectedTeam.name}! 🎉`);
      handleCloseDialog();
      
      // Small delay before refresh so user sees the toast
      setTimeout(() => {
        router.refresh();
      }, 500);
    } catch (err: any) {
      const errorMsg = err.message || 'An error occurred while joining the team';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setIsJoining(false);
    }
  };

  const getTeamLeader = (team: RecommendedTeam) => {
    return team.leaderId || null;
  };

  const getMatchScoreColor = (score?: number) => {
    if (!score) return 'default';
    if (score >= 80) return 'success';
    if (score >= 60) return 'primary';
    if (score >= 40) return 'warning';
    return 'default';
  };

  if (!recommendedTeams || recommendedTeams.length === 0) {
    return (
      <Box id="browse-teams">
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PeopleIcon color="primary" />
          Find a Team
        </Typography>

        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              No teams are currently looking for members.
            </Typography>
            <Button
              variant="contained"
              href={`/events/${eventId}/teams/new`}
              startIcon={<JoinIcon />}
            >
              Create Your Own Team
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box id="browse-teams">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PeopleIcon color="primary" />
          Find a Team
        </Typography>
        <Button
          variant="outlined"
          size="small"
          href={`/events/${eventId}/teams/new`}
        >
          Create Team
        </Button>
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Join a team looking for members. We've recommended teams based on your skills and interests.
      </Typography>

      <Grid container spacing={3}>
        {recommendedTeams.map((team) => {
          const leader = getTeamLeader(team);
          const spotsLeft = team.maxMembers - team.members.length;
          const matchColor = getMatchScoreColor(team.matchScore);

          return (
            <Grid size={{ xs: 12, md: 6 }} key={team._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {team.name}
                    </Typography>
                    {team.matchScore !== undefined && (
                      <Tooltip title={`${team.matchScore}% match based on your skills`}>
                        <Chip
                          icon={<StarIcon />}
                          label={`${team.matchScore}% Match`}
                          color={matchColor as any}
                          size="small"
                        />
                      </Tooltip>
                    )}
                  </Box>

                  {/* Description */}
                  {team.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {team.description}
                    </Typography>
                  )}

                  {/* Match Reasons */}
                  {team.matchReasons && team.matchReasons.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      {team.matchReasons.slice(0, 2).map((reason, idx) => (
                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <CheckIcon sx={{ fontSize: 16, color: 'success.main' }} />
                          <Typography variant="caption" color="text.secondary">
                            {reason}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {/* Skills */}
                  {(team.desiredSkills || team.requiredSkills || team.preferredSkills) && (
                    <Box sx={{ mb: 2 }}>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
                        {team.desiredSkills?.map((skill) => (
                          <Chip
                            key={skill}
                            label={skill}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                        {team.requiredSkills?.map((skill) => (
                          <Chip
                            key={skill}
                            label={skill}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                        {team.preferredSkills?.slice(0, 3).map((skill) => (
                          <Chip
                            key={skill}
                            label={skill}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {/* Team Info */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 32, height: 32 } }}>
                      {team.members.map((member) => (
                        <Avatar
                          key={member._id}
                          alt={member.name}
                          src={member.avatar}
                        >
                          {member.name.charAt(0)}
                        </Avatar>
                      ))}
                    </AvatarGroup>
                    <Typography variant="body2" color="text.secondary">
                      {team.members.length} / {team.maxMembers} members
                    </Typography>
                    {spotsLeft > 0 && (
                      <Chip
                        label={`${spotsLeft} spot${spotsLeft > 1 ? 's' : ''} left`}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  {/* Leader Info */}
                  {leader && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Led by
                      </Typography>
                      <Avatar
                        alt={leader.name}
                        src={leader.avatar}
                        sx={{ width: 20, height: 20 }}
                      >
                        {leader.name.charAt(0)}
                      </Avatar>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {leader.name}
                      </Typography>
                    </Box>
                  )}

                  {/* Actions */}
                  <Box sx={{ mt: 'auto', pt: 2 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<JoinIcon />}
                      onClick={() => handleOpenTeamDialog(team)}
                      disabled={spotsLeft === 0}
                    >
                      {spotsLeft === 0 ? 'Team Full' : 'Join Team'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Join Team Dialog */}
      <Dialog open={!!selectedTeam} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Join {selectedTeam?.name}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary" paragraph>
            You're about to join this team. This is instant — no approval needed.
          </Typography>

          {selectedTeam?.description && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                About this team
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedTeam.description}
              </Typography>
            </Box>
          )}

          {selectedTeam && selectedTeam.members.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Current members ({selectedTeam.members.length})
              </Typography>
              <Stack spacing={1}>
                {selectedTeam.members.map((member) => (
                  <Box
                    key={member._id}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <Avatar
                      alt={member.name}
                      src={member.avatar}
                      sx={{ width: 32, height: 32 }}
                    >
                      {member.name.charAt(0)}
                    </Avatar>
                    <Typography variant="body2">
                      {member.name}
                    </Typography>
                    {selectedTeam?.leaderId?._id === member._id && (
                      <Chip label="Leader" size="small" color="primary" />
                    )}
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isJoining}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleJoinTeam}
            disabled={isJoining}
            startIcon={isJoining ? <CircularProgress size={16} /> : <JoinIcon />}
          >
            {isJoining ? 'Joining...' : 'Join Team'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
