"use client";

import { Card, CardContent, Box, Typography, Button, Chip, Grid, Avatar } from "@mui/material";
import {
  Search as SearchIcon,
  People as PeopleIcon,
  Add as AddIcon,
  ArrowForward as ArrowIcon,
} from "@mui/icons-material";
import Link from "next/link";

interface BrowseTeamsSectionProps {
  teams: any[];
  eventId: string;
  participantId: string;
}

export default function BrowseTeamsSection({
  teams,
  eventId,
  participantId,
}: BrowseTeamsSectionProps) {
  return (
    <Card elevation={2}>
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <SearchIcon sx={{ fontSize: 32, color: "warning.main" }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
              Find Your Team
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You haven't joined a team yet. Browse teams looking for members.
            </Typography>
          </Box>
        </Box>

        {/* Recommended Teams */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{ mb: 2, fontWeight: 600, color: "text.secondary" }}
          >
            TEAMS LOOKING FOR MEMBERS
          </Typography>
          <Grid container spacing={2}>
            {teams.slice(0, 3).map((team) => {
              const spotsLeft = team.maxMembers - (team.members?.length || 0);
              return (
                <Grid key={team._id} size={{ xs: 12, md: 6, lg: 4 }}>
                  <Box
                    sx={{
                      p: 2.5,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 2,
                      bgcolor: "background.paper",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      "&:hover": {
                        borderColor: "primary.main",
                        boxShadow: 2,
                      },
                      transition: "all 0.2s",
                    }}
                  >
                    {/* Team Header */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: "primary.light",
                          color: "primary.main",
                          width: 40,
                          height: 40,
                        }}
                      >
                        <PeopleIcon />
                      </Avatar>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 600,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {team.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {team.members?.length || 0}/{team.maxMembers} members
                        </Typography>
                      </Box>
                    </Box>

                    {/* Description */}
                    {team.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {team.description}
                      </Typography>
                    )}

                    {/* Looking For */}
                    {team.desiredSkills && team.desiredSkills.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mb: 0.5 }}
                        >
                          Looking for:
                        </Typography>
                        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                          {team.desiredSkills.slice(0, 3).map((skill: string) => (
                            <Chip key={skill} label={skill} size="small" variant="outlined" />
                          ))}
                          {team.desiredSkills.length > 3 && (
                            <Chip
                              label={`+${team.desiredSkills.length - 3}`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>
                    )}

                    {/* Spots Left */}
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={`${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} available`}
                        size="small"
                        color={spotsLeft <= 1 ? "warning" : "success"}
                        sx={{ fontSize: "0.75rem" }}
                      />
                    </Box>

                    {/* Actions */}
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        mt: "auto",
                        pt: 2,
                        borderTop: 1,
                        borderColor: "divider",
                      }}
                    >
                      <Button
                        variant="outlined"
                        size="small"
                        component={Link}
                        href={`/events/${eventId}/teams/${team._id}`}
                        fullWidth
                      >
                        View
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        component={Link}
                        href={`/events/${eventId}/teams`}
                        fullWidth
                      >
                        Join
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* Call to Action */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexDirection: { xs: "column", sm: "row" },
            pt: 2,
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <Button
            variant="outlined"
            startIcon={<SearchIcon />}
            component={Link}
            href={`/events/${eventId}/teams`}
            endIcon={<ArrowIcon />}
            fullWidth
          >
            Browse All {teams.length} Teams
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={Link}
            href={`/events/${eventId}/teams/new`}
            fullWidth
          >
            Create Your Team
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
