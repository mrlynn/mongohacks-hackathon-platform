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
} from "@mui/material";
import {
  People as PeopleIcon,
  ArrowBack as BackIcon,
  PersonAdd as JoinIcon,
  ExitToApp as LeaveIcon,
  Edit as EditIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface TeamDetailClientProps {
  team: any;
  event: any;
  participant: any;
  isLeader: boolean;
  isMember: boolean;
  eventId: string;
  teamId: string;
}

export default function TeamDetailClient({
  team,
  event,
  participant,
  isLeader,
  isMember,
  eventId,
  teamId,
}: TeamDetailClientProps) {
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);
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

  const spotsLeft = team.maxMembers - (team.members?.length || 0);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<BackIcon />}
        component={Link}
        href={`/events/${eventId}/hub`}
        sx={{ mb: 3 }}
      >
        Back to Event Hub
      </Button>

      <Card elevation={2}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 3 }}>
            <PeopleIcon sx={{ fontSize: 40, color: "primary.main" }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
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
            <Box sx={{ mb: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
              <Typography variant="body1">{team.description}</Typography>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Team Stats */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
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

            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary" display="block">
                Status
              </Typography>
              <Typography variant="h6">
                {team.lookingForMembers ? "Looking for Members" : "Team Complete"}
              </Typography>
            </Grid>

            {team.requiredSkills && team.requiredSkills.length > 0 && (
              <Grid item xs={12} sm={4}>
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

          {/* Actions */}
          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
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

            {isMember && !isLeader && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<LeaveIcon />}
              >
                Leave Team
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
