"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Chip,
  Avatar,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  SwapHoriz as TransferIcon,
  PersonRemove as RemoveIcon,
  Star as StarIcon,
} from "@mui/icons-material";

interface TeamMember {
  _id: string;
  name: string;
  email?: string;
}

interface TeamData {
  _id: string;
  name: string;
  description?: string;
  lookingForMembers: boolean;
  maxMembers: number;
  requiredSkills?: string[];
  members: TeamMember[];
  leaderId: { _id: string } | string;
}

export default function EditTeamPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const teamId = params.teamId as string;

  const [team, setTeam] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [lookingForMembers, setLookingForMembers] = useState(true);
  const [skillInput, setSkillInput] = useState("");
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);

  // Dialogs
  const [transferTarget, setTransferTarget] = useState<TeamMember | null>(null);
  const [removeTarget, setRemoveTarget] = useState<TeamMember | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const leaderId =
    team?.leaderId && typeof team.leaderId === "object"
      ? team.leaderId._id
      : (team?.leaderId as string);

  const loadTeam = useCallback(async () => {
    try {
      const res = await fetch(`/api/events/${eventId}/teams/${teamId}`);
      const data = await res.json();
      if (data.success && data.team) {
        const t = data.team;
        setTeam(t);
        setName(t.name);
        setDescription(t.description || "");
        setLookingForMembers(t.lookingForMembers ?? true);
        setRequiredSkills(t.requiredSkills || []);
      } else {
        setError("Failed to load team");
      }
    } catch {
      setError("Failed to load team");
    } finally {
      setLoading(false);
    }
  }, [eventId, teamId]);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/events/${eventId}/teams/${teamId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          lookingForMembers,
          requiredSkills,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess("Team updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Failed to update team");
      }
    } catch {
      setError("Failed to update team");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = () => {
    const skill = skillInput.trim();
    if (skill && !requiredSkills.includes(skill)) {
      setRequiredSkills([...requiredSkills, skill]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== skill));
  };

  const handleTransferLeadership = async () => {
    if (!transferTarget) return;
    setIsTransferring(true);
    setError("");

    try {
      const res = await fetch(
        `/api/events/${eventId}/teams/${teamId}/transfer-leader`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newLeaderId: transferTarget._id }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setSuccess("Leadership transferred successfully!");
        setTransferTarget(null);
        // Redirect since current user is no longer leader
        setTimeout(() => {
          router.push(`/events/${eventId}/teams/${teamId}`);
        }, 1500);
      } else {
        setError(data.error || "Failed to transfer leadership");
      }
    } catch {
      setError("Failed to transfer leadership");
    } finally {
      setIsTransferring(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!removeTarget) return;
    setIsRemoving(true);
    setError("");

    try {
      const res = await fetch(
        `/api/events/${eventId}/teams/${teamId}/remove-member`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberId: removeTarget._id }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setSuccess(`${removeTarget.name} removed from team`);
        setRemoveTarget(null);
        loadTeam(); // Refresh team data
      } else {
        setError(data.error || "Failed to remove member");
      }
    } catch {
      setError("Failed to remove member");
    } finally {
      setIsRemoving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!team) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">Team not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 } }}>
      <Button
        startIcon={<BackIcon />}
        onClick={() => router.push(`/events/${eventId}/teams/${teamId}`)}
        sx={{ mb: 3 }}
      >
        Back to Team
      </Button>

      <Typography
        variant="h4"
        sx={{ fontWeight: 700, mb: 3, fontSize: { xs: "1.5rem", sm: "2rem" } }}
      >
        Manage Team
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Team Info Form */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Team Information
          </Typography>

          <TextField
            fullWidth
            label="Team Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ mb: 2 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={lookingForMembers}
                onChange={(e) => setLookingForMembers(e.target.checked)}
              />
            }
            label="Looking for members"
            sx={{ mb: 2, display: "block" }}
          />

          {/* Skills */}
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Required Skills
          </Typography>
          <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
            <TextField
              size="small"
              placeholder="Add a skill..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              sx={{ flex: 1 }}
            />
            <Button variant="outlined" onClick={handleAddSkill} size="small">
              Add
            </Button>
          </Box>
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mb: 2 }}>
            {requiredSkills.map((skill) => (
              <Chip
                key={skill}
                label={skill}
                size="small"
                onDelete={() => handleRemoveSkill(skill)}
              />
            ))}
          </Box>

          <Button
            variant="contained"
            startIcon={saving ? null : <SaveIcon />}
            onClick={handleSave}
            disabled={saving || !name.trim()}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Members Management */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Members ({team.members.length})
          </Typography>

          <List disablePadding>
            {team.members.map((member) => {
              const isLeaderMember = member._id === leaderId;
              return (
                <ListItem
                  key={member._id}
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                    mb: 1,
                    pr: isLeaderMember ? 2 : 12,
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      {member.name?.charAt(0).toUpperCase() || "U"}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {member.name}
                        {isLeaderMember && (
                          <Chip
                            label="Leader"
                            size="small"
                            color="warning"
                            icon={<StarIcon sx={{ fontSize: 14 }} />}
                          />
                        )}
                      </Box>
                    }
                    secondary={member.email}
                  />
                  {!isLeaderMember && (
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        title="Transfer leadership"
                        onClick={() => setTransferTarget(member)}
                        sx={{ mr: 0.5 }}
                      >
                        <TransferIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        title="Remove from team"
                        onClick={() => setRemoveTarget(member)}
                        color="error"
                      >
                        <RemoveIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              );
            })}
          </List>
        </CardContent>
      </Card>

      {/* Transfer Leadership Dialog */}
      <Dialog
        open={!!transferTarget}
        onClose={() => setTransferTarget(null)}
      >
        <DialogTitle>Transfer Leadership</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to transfer leadership to{" "}
            <strong>{transferTarget?.name}</strong>? You will lose leader
            privileges and become a regular member.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransferTarget(null)}>Cancel</Button>
          <Button
            onClick={handleTransferLeadership}
            color="warning"
            disabled={isTransferring}
          >
            {isTransferring ? "Transferring..." : "Transfer Leadership"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Remove Member Dialog */}
      <Dialog open={!!removeTarget} onClose={() => setRemoveTarget(null)}>
        <DialogTitle>Remove Member</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove{" "}
            <strong>{removeTarget?.name}</strong> from the team?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveTarget(null)}>Cancel</Button>
          <Button
            onClick={handleRemoveMember}
            color="error"
            disabled={isRemoving}
          >
            {isRemoving ? "Removing..." : "Remove Member"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
