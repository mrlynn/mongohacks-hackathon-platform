"use client";

import { Card, CardContent, Box, Typography, Avatar, Chip, Button, Alert } from "@mui/material";
import {
  People as PeopleIcon,
  Star as LeaderIcon,
  ExitToApp as LeaveIcon,
  PersonAdd as InviteIcon,
  Message as MessageIcon,
} from "@mui/icons-material";
import Link from "next/link";

interface YourTeamSectionProps {
  team: any;
  eventId: string;
  participant: any;
}

export default function YourTeamSection({
  team,
  eventId,
  participant,
}: YourTeamSectionProps) {
  const isLeader = participant.userId === team.leaderId?._id;

  return (
    <Card elevation={2} id="your-team">
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <PeopleIcon sx={{ fontSize: 32, color: "primary.main" }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
              Your Team
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {team.name}
            </Typography>
          </Box>
          <Chip
            label={`${team.members?.length || 0}/${team.maxMembers} Members`}
            color="primary"
            variant="outlined"
          />
        </Box>

        {/* Team Info */}
        {team.description && (
          <Box sx={{ mb: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {team.description}
            </Typography>
          </Box>
        )}

        {/* Skills */}
        {team.desiredSkills && team.desiredSkills.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
              Team Skills:
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {team.desiredSkills.map((skill: string) => (
                <Chip key={skill} label={skill} size="small" />
              ))}
            </Box>
          </Box>
        )}

        {/* Team Members */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Team Members:
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {team.members?.map((member: any) => (
              <Box
                key={member._id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.5,
                  bgcolor: "background.paper",
                  borderRadius: 1,
                  border: 1,
                  borderColor: "divider",
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: "primary.main",
                    width: 40,
                    height: 40,
                    fontSize: "1rem",
                    fontWeight: 600,
                  }}
                >
                  {member.name?.charAt(0).toUpperCase() || "U"}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {member.name || "Anonymous"}
                    </Typography>
                    {member._id === team.leaderId?._id && (
                      <Chip
                        icon={<LeaderIcon sx={{ fontSize: 14 }} />}
                        label="Leader"
                        size="small"
                        color="warning"
                        sx={{ height: 20, fontSize: "0.7rem" }}
                      />
                    )}
                    {member._id === participant.userId && (
                      <Chip
                        label="You"
                        size="small"
                        color="info"
                        sx={{ height: 20, fontSize: "0.7rem" }}
                      />
                    )}
                  </Box>
                  {member.email && (
                    <Typography variant="caption" color="text.secondary">
                      {member.email}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Communication Section */}
        {team.discordChannelUrl || team.slackChannelUrl || team.otherCommunicationUrl ? (
          <Box sx={{ mb: 3, p: 2, bgcolor: "primary.light", borderRadius: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <MessageIcon sx={{ color: "primary.main" }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Team Communication
              </Typography>
            </Box>
            
            {team.discordChannelUrl && (
              <Button
                variant="contained"
                color="primary"
                href={team.discordChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<MessageIcon />}
                fullWidth
                sx={{ mb: 1 }}
              >
                Join Team Discord Channel
              </Button>
            )}
            
            {team.slackChannelUrl && (
              <Button
                variant="contained"
                color="primary"
                href={team.slackChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<MessageIcon />}
                fullWidth
                sx={{ mb: 1 }}
              >
                Join Team Slack Channel
              </Button>
            )}
            
            {team.otherCommunicationUrl && !team.discordChannelUrl && !team.slackChannelUrl && (
              <Button
                variant="contained"
                color="primary"
                href={team.otherCommunicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<MessageIcon />}
                fullWidth
                sx={{ mb: 1 }}
              >
                Join Team Chat
              </Button>
            )}
            
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
              Use this channel to coordinate with your team, share progress, and ask questions.
            </Typography>
          </Box>
        ) : (
          <Alert
            severity="info"
            icon={<MessageIcon />}
            sx={{ mb: 3 }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
              Team Communication
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Coordinate with your team using Discord, Slack, or your preferred communication tool.
              Exchange contact information with your teammates above.
            </Typography>
            {isLeader && (
              <Typography variant="body2" sx={{ fontWeight: 500, color: "info.dark" }}>
                As team leader, you can set up a communication channel on the team page.
              </Typography>
            )}
          </Alert>
        )}

        {/* Actions */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            component={Link}
            href={`/events/${eventId}/teams/${team._id}`}
            fullWidth={false}
          >
            View Full Team Page
          </Button>
          {isLeader && (
            <Button
              variant="outlined"
              startIcon={<InviteIcon />}
              fullWidth={false}
            >
              Invite Member
            </Button>
          )}
          {!isLeader && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<LeaveIcon />}
              fullWidth={false}
            >
              Leave Team
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
