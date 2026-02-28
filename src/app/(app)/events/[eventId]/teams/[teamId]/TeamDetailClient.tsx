"use client";

import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Grid,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  People as PeopleIcon,
  ArrowBack as BackIcon,
  PersonAdd as JoinIcon,
  ExitToApp as LeaveIcon,
  Edit as EditIcon,
  Star as StarIcon,
  Storage as StorageIcon,
} from "@mui/icons-material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import TeamNotes from "@/components/shared-ui/TeamNotes";
import ProjectSuggestionsCTA from "@/components/project-suggestions/ProjectSuggestionsCTA";

interface TeamDetailClientProps {
  team: any;
  event: any;
  participant: any;
  isLeader: boolean;
  isMember: boolean;
  eventId: string;
  teamId: string;
  currentUserId: string;
}

export default function TeamDetailClient({
  team,
  event,
  participant,
  isLeader,
  isMember,
  eventId,
  teamId,
  currentUserId,
}: TeamDetailClientProps) {
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [error, setError] = useState("");

  const handleJoinTeam = async () => {
    setIsJoining(true);
    setError("");

    try {
      const res = await fetch(`/api/events/${eventId}/teams/${teamId}/join`, {
        method: "POST",
      });

      if (res.ok) {
        router.push(`/events/${eventId}/hub`);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to join team");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveTeam = async () => {
    setIsLeaving(true);
    setError("");

    try {
      const res = await fetch(`/api/events/${eventId}/teams/${teamId}/leave`, {
        method: "POST",
      });

      if (res.ok) {
        router.push(`/events/${eventId}/hub`);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to leave team");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setIsLeaving(false);
      setShowLeaveConfirm(false);
    }
  };

  const spotsLeft = team.maxMembers - (team.members?.length || 0);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
      <Button
        startIcon={<BackIcon />}
        component={Link}
        href={`/events/${eventId}/hub`}
        sx={{ mb: 3 }}
      >
        Back to Event Hub
      </Button>

      <Card elevation={2}>
        <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 3, flexWrap: "wrap" }}>
            <PeopleIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: "primary.main" }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1, fontSize: { xs: "1.5rem", sm: "2rem" } }}>
                {team.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {event.name}
              </Typography>
            </Box>
            {isMember && (
              <Chip label="Member" color="success" icon={<StarIcon />} />
            )}
            {isLeader && (
              <Chip label="Team Leader" color="warning" icon={<StarIcon />} />
            )}
          </Box>

          {/* Description */}
          {team.description && (
            <Box sx={{ mb: 3, p: 2, bgcolor: "action.hover", borderRadius: 1 }}>
              <Typography variant="body1">{team.description}</Typography>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Team Stats */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Team Size
              </Typography>
              <Typography variant="h6">
                {team.members?.length || 0} / {team.maxMembers} Members
              </Typography>
              {spotsLeft > 0 && (
                <Chip
                  label={`${spotsLeft} spot${spotsLeft > 1 ? "s" : ""} available`}
                  size="small"
                  color="success"
                  sx={{ mt: 1 }}
                />
              )}
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Status
              </Typography>
              <Typography variant="h6">
                {team.lookingForMembers ? "Looking for Members" : "Team Complete"}
              </Typography>
            </Grid>

            {team.requiredSkills && team.requiredSkills.length > 0 && (
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Required Skills
                </Typography>
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 1 }}>
                  {team.requiredSkills.map((skill: string) => (
                    <Chip key={skill} label={skill} size="small" />
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Members */}
          <Typography variant="h6" sx={{ mb: 2 }}>
            Team Members ({team.members?.length || 0})
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {team.members?.map((member: any, index: number) => (
              <Box
                key={member._id || `member-${index}`}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 2,
                  bgcolor: "background.paper",
                  borderRadius: 1,
                  border: 1,
                  borderColor: "divider",
                }}
              >
                <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48 }}>
                  {member.name?.charAt(0).toUpperCase() || "U"}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {member.name || "Unknown"}
                    </Typography>
                    {member._id === team.leaderId?._id && (
                      <Chip
                        label="Leader"
                        size="small"
                        color="warning"
                        icon={<StarIcon sx={{ fontSize: 14 }} />}
                      />
                    )}
                  </Box>
                  {member.email && (
                    <Typography variant="caption" color="text.secondary">
                      {member.email}
                    </Typography>
                  )}
                </Box>
                {member.role && (
                  <Chip label={member.role} size="small" variant="outlined" />
                )}
              </Box>
            ))}
          </Box>

          {/* Project Ideas CTA - visible to members */}
          {isMember && (
            <>
              <Divider sx={{ my: 3 }} />
              <ProjectSuggestionsCTA
                variant="card"
                eventId={eventId}
                title="Need project ideas?"
                description="Use AI to brainstorm project ideas tailored to this hackathon. Generate, refine, and share ideas with your team."
              />
            </>
          )}

          {/* Team Notes - visible to members only */}
          {isMember && (
            <>
              <Divider sx={{ my: 3 }} />
              <TeamNotes
                teamId={teamId}
                eventId={eventId}
                isMember={isMember}
                currentUserId={currentUserId}
                isLeader={isLeader}
              />
            </>
          )}

          {/* Actions */}
          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: "flex", gap: 2, mt: 4, flexWrap: "wrap" }}>
            {!isMember && participant && spotsLeft > 0 && (
              <Button
                variant="contained"
                startIcon={<JoinIcon />}
                onClick={handleJoinTeam}
                disabled={isJoining}
              >
                {isJoining ? "Joining..." : "Join Team"}
              </Button>
            )}

            {isLeader && (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                component={Link}
                href={`/events/${eventId}/teams/${teamId}/edit`}
              >
                Manage Team
              </Button>
            )}

            {isMember && (
              <Button
                variant="outlined"
                startIcon={<StorageIcon />}
                component={Link}
                href={`/teams/${teamId}/atlas`}
              >
                Atlas Cluster
              </Button>
            )}

            {isMember && !isLeader && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<LeaveIcon />}
                onClick={() => setShowLeaveConfirm(true)}
                disabled={isLeaving}
              >
                {isLeaving ? "Leaving..." : "Leave Team"}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Leave Team Confirmation Dialog */}
      <Dialog open={showLeaveConfirm} onClose={() => setShowLeaveConfirm(false)}>
        <DialogTitle>Leave Team?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to leave <strong>{team.name}</strong>? You can rejoin later if spots are available.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLeaveConfirm(false)}>Cancel</Button>
          <Button onClick={handleLeaveTeam} color="error" disabled={isLeaving}>
            {isLeaving ? "Leaving..." : "Leave Team"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
