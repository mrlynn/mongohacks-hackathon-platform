"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Avatar,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Language as WebsiteIcon,
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
  GitHub as GitHubIcon,
} from "@mui/icons-material";
import { mongoBrand } from "@/styles/theme";

interface Contact {
  name: string;
  email: string;
  phone?: string;
  role: string;
  isPrimary: boolean;
}

interface Partner {
  _id: string;
  name: string;
  description: string;
  logo?: string;
  website?: string;
  industry: string;
  tier: "platinum" | "gold" | "silver" | "bronze" | "community";
  status: "active" | "inactive" | "pending";
  contacts: Contact[];
  companyInfo?: {
    size?: string;
    headquarters?: string;
    foundedYear?: number;
  };
  social?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  tags: string[];
  engagement?: {
    eventsParticipated: string[];
    prizesOffered: string[];
    engagementLevel?: "low" | "medium" | "high";
  };
}

const tierColors = {
  platinum: mongoBrand.gray[400],
  gold: mongoBrand.warningYellow,
  silver: mongoBrand.gray[300],
  bronze: "#CD7F32",
  community: mongoBrand.springGreen,
};

const statusColors = {
  active: mongoBrand.forestGreen,
  inactive: mongoBrand.gray[400],
  pending: mongoBrand.warningYellow,
};

export default function PartnersView() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [filterTier, setFilterTier] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo: "",
    website: "",
    industry: "",
    tier: "bronze" as Partner["tier"],
    status: "pending" as Partner["status"],
    tags: [] as string[],
  });

  const handleOpenDialog = (partner?: Partner) => {
    if (partner) {
      setEditingPartner(partner);
      setFormData({
        name: partner.name,
        description: partner.description,
        logo: partner.logo || "",
        website: partner.website || "",
        industry: partner.industry,
        tier: partner.tier,
        status: partner.status,
        tags: partner.tags,
      });
    } else {
      setEditingPartner(null);
      setFormData({
        name: "",
        description: "",
        logo: "",
        website: "",
        industry: "",
        tier: "bronze",
        status: "pending",
        tags: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPartner(null);
  };

  const handleSubmit = async () => {
    // TODO: Implement API call
    console.log("Submitting partner:", formData);
    handleCloseDialog();
  };

  const filteredPartners = partners.filter((partner) => {
    if (filterTier !== "all" && partner.tier !== filterTier) return false;
    if (filterStatus !== "all" && partner.status !== filterStatus) return false;
    return true;
  });

  const getTierLabel = (tier: string) => {
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };

  const getEngagementBadge = (level?: string) => {
    if (!level) return null;
    const colors = {
      low: mongoBrand.gray[300],
      medium: mongoBrand.warningYellow,
      high: mongoBrand.springGreen,
    };
    return (
      <Chip
        label={level.toUpperCase()}
        size="small"
        sx={{
          backgroundColor: colors[level as keyof typeof colors],
          color: "white",
          fontWeight: 600,
          fontSize: "0.7rem",
        }}
      />
    );
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>
          Partners
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            backgroundColor: mongoBrand.forestGreen,
            "&:hover": { backgroundColor: mongoBrand.evergreen },
          }}
        >
          Add Partner
        </Button>
      </Stack>

      {/* Filters */}
      <Stack direction="row" spacing={2} mb={3}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Tier</InputLabel>
          <Select
            value={filterTier}
            label="Tier"
            onChange={(e) => setFilterTier(e.target.value)}
          >
            <MenuItem value="all">All Tiers</MenuItem>
            <MenuItem value="platinum">Platinum</MenuItem>
            <MenuItem value="gold">Gold</MenuItem>
            <MenuItem value="silver">Silver</MenuItem>
            <MenuItem value="bronze">Bronze</MenuItem>
            <MenuItem value="community">Community</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            label="Status"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Partners Grid */}
      {filteredPartners.length === 0 ? (
        <Alert severity="info">
          No partners found. Click "Add Partner" to create your first partner.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredPartners.map((partner) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={partner._id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderLeft: `4px solid ${tierColors[partner.tier]}`,
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack spacing={2}>
                    {/* Header with logo */}
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Avatar
                        src={partner.logo}
                        alt={partner.name}
                        sx={{
                          width: 56,
                          height: 56,
                          backgroundColor: mongoBrand.mist,
                          color: mongoBrand.forestGreen,
                        }}
                      >
                        <BusinessIcon />
                      </Avatar>
                      <Box flexGrow={1}>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                          {partner.name}
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          <Chip
                            label={getTierLabel(partner.tier)}
                            size="small"
                            sx={{
                              backgroundColor: tierColors[partner.tier],
                              color: "white",
                              fontWeight: 600,
                            }}
                          />
                          <Chip
                            label={partner.status}
                            size="small"
                            sx={{
                              backgroundColor: statusColors[partner.status],
                              color: "white",
                              fontWeight: 600,
                            }}
                          />
                          {getEngagementBadge(partner.engagement?.engagementLevel)}
                        </Stack>
                      </Box>
                    </Stack>

                    <Typography variant="body2" color="text.secondary" noWrap>
                      {partner.description}
                    </Typography>

                    <Divider />

                    {/* Company Info */}
                    <Stack spacing={1}>
                      <Typography variant="caption" fontWeight={600} color="text.secondary">
                        Industry: {partner.industry}
                      </Typography>
                      {partner.companyInfo?.headquarters && (
                        <Typography variant="caption" color="text.secondary">
                          📍 {partner.companyInfo.headquarters}
                        </Typography>
                      )}
                    </Stack>

                    {/* Contact */}
                    {partner.contacts.length > 0 && (
                      <Stack spacing={0.5}>
                        <Typography variant="caption" fontWeight={600} color="text.secondary">
                          Primary Contact
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <EmailIcon fontSize="small" sx={{ color: mongoBrand.gray[400] }} />
                          <Typography variant="caption">
                            {partner.contacts[0].email}
                          </Typography>
                        </Stack>
                      </Stack>
                    )}

                    {/* Engagement Stats */}
                    {partner.engagement && (
                      <Stack direction="row" spacing={2}>
                        <Box>
                          <Typography variant="h6" fontWeight={700} color="primary.main">
                            {partner.engagement.eventsParticipated.length}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Events
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="h6" fontWeight={700} color="secondary.main">
                            {partner.engagement.prizesOffered.length}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Prizes
                          </Typography>
                        </Box>
                      </Stack>
                    )}

                    {/* Tags */}
                    {partner.tags.length > 0 && (
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {partner.tags.slice(0, 3).map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: "0.7rem" }}
                          />
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </CardContent>

                {/* Actions */}
                <Divider />
                <Box p={1.5}>
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    {partner.website && (
                      <IconButton
                        size="small"
                        href={partner.website}
                        target="_blank"
                        sx={{ color: mongoBrand.blue }}
                      >
                        <WebsiteIcon fontSize="small" />
                      </IconButton>
                    )}
                    {partner.social?.linkedin && (
                      <IconButton
                        size="small"
                        href={partner.social.linkedin}
                        target="_blank"
                        sx={{ color: mongoBrand.blue }}
                      >
                        <LinkedInIcon fontSize="small" />
                      </IconButton>
                    )}
                    <Box flexGrow={1} />
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(partner)}
                      sx={{ color: mongoBrand.forestGreen }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      sx={{ color: mongoBrand.errorRed }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPartner ? "Edit Partner" : "Add New Partner"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} mt={2}>
            <TextField
              label="Partner Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
            />

            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              required
              fullWidth
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Logo URL"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Industry"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  required
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Tier</InputLabel>
                  <Select
                    value={formData.tier}
                    label="Tier"
                    onChange={(e) =>
                      setFormData({ ...formData, tier: e.target.value as Partner["tier"] })
                    }
                  >
                    <MenuItem value="platinum">Platinum</MenuItem>
                    <MenuItem value="gold">Gold</MenuItem>
                    <MenuItem value="silver">Silver</MenuItem>
                    <MenuItem value="bronze">Bronze</MenuItem>
                    <MenuItem value="community">Community</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as Partner["status"] })
                }
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              backgroundColor: mongoBrand.forestGreen,
              "&:hover": { backgroundColor: mongoBrand.evergreen },
            }}
          >
            {editingPartner ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
