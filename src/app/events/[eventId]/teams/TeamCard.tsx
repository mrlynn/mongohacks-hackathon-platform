"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  Chip,
  Alert,
} from "@mui/material";
import { People as PeopleIcon } from "@mui/icons-material";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Team {
  _id: string;
  name: string;
  description: string;
  maxMembers: number;
  members: Array<{ _id: string; name: string; email: string }>;
  leaderId: { _id: string; name: string; email: string } | null;
  desiredSkills: string[];
  lookingForMembers: boolean;
}

interface TeamCardProps {
  team: Team;
  eventId: string;
  userId: string | null;
  userTeamId: string | null;
}

export default function TeamCard({ team, eventId, userId, userTeamId }: TeamCardProps) {
  const router = useRouter();
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  const isTeamFull = team.members.length >= team.maxMembers;
  const isUserInTeam = userTeamId === team._id;
  const userAlreadyOnTeam = userTeamId && userTeamId !== team._id;
  const canJoin = userId && !isTeamFull && !isUserInTeam && !userAlreadyOnTeam;

  const handleJoinTeam = async () => {
    if (!userId) {
      router.push(`/login?redirect=/events/${eventId}/teams`);
      return;
    }

    setJoining(true);
    setError("");

    try {
      const res = await fetch(`/api/events/${eventId}/teams/${team._id}/join`, {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        router.refresh(); // Reload page to show updated team
      } else {
        setError(data.message || "Failed to join team");
      }
    } catch (err) {
      setError("Failed to join team. Please try again.");
    } finally {
      setJoining(false);
    }
  };

  return (
    <Card elevation={2} sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <PeopleIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {team.name}
          </Typography>
        </Box>

        {isUserInTeam && (
          <Alert severity="info" sx={{ mb: 2 }}>
            You're a member of this team
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {team.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {team.description}
          </Typography>
        )}

        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Team Leader
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {team.leaderId?.name || "Unknown"}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Members
          </Typography>
          <Typography variant="body2">
            {team.members.length} / {team.maxMembers}
          </Typography>
        </Box>

        {team.desiredSkills && team.desiredSkills.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 0.5, display: "block" }}
            >
              Looking for
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {team.desiredSkills.map((skill) => (
                <Chip key={skill} label={skill} size="small" variant="outlined" />
              ))}
            </Box>
          </Box>
        )}

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            component={Link}
            href={`/events/${eventId}/teams/${team._id}`}
          >
            View Details
          </Button>
          <Button
            variant="contained"
            size="small"
            fullWidth
            onClick={handleJoinTeam}
            disabled={!canJoin || joining}
          >
            {joining
              ? "Joining..."
              : isUserInTeam
                ? "Joined"
                : isTeamFull
                  ? "Full"
                  : userAlreadyOnTeam
                    ? "Already on Team"
                    : "Join Team"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
