"use client";

import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Alert,
} from "@mui/material";
import {
  Business as BusinessIcon,
  AdminPanelSettings as AdminIcon,
} from "@mui/icons-material";

interface PartnerSummary {
  _id: string;
  name: string;
  tier: string;
  status: string;
  logo?: string;
  eventCount: number;
}

const tierColors: Record<string, string> = {
  platinum: "#E5E4E2",
  gold: "#FFD700",
  silver: "#C0C0C0",
  bronze: "#CD7F32",
  community: "#00ED64",
};

export default function AdminPartnerPicker({
  partners,
}: {
  partners: PartnerSummary[];
}) {
  const router = useRouter();

  const handleSelect = async (partnerId: string) => {
    await fetch("/api/partner/select", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partnerId }),
    });
    router.refresh();
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <AdminIcon color="primary" />
        <Typography variant="h5" fontWeight={700}>
          Partner Portal
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        You are viewing the Partner Portal as an administrator. Select a partner organization to view their portal.
      </Alert>

      {partners.length === 0 ? (
        <Card variant="outlined">
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <BusinessIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
            <Typography color="text.secondary">
              No partner organizations found. Create partners from the admin panel.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card variant="outlined">
          <List disablePadding>
            {partners.map((p, index) => (
              <ListItemButton
                key={p._id}
                divider={index < partners.length - 1}
                sx={{ py: 2 }}
                onClick={() => handleSelect(p._id)}
              >
                <ListItemAvatar>
                  <Avatar
                    src={p.logo}
                    sx={{ bgcolor: "primary.main" }}
                  >
                    <BusinessIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography fontWeight={600}>{p.name}</Typography>
                      <Chip
                        label={p.tier}
                        size="small"
                        sx={{
                          bgcolor: tierColors[p.tier] || "grey.300",
                          color:
                            p.tier === "platinum" || p.tier === "silver"
                              ? "black"
                              : "white",
                          fontWeight: 600,
                          fontSize: "0.7rem",
                          height: 22,
                        }}
                      />
                      <Chip
                        label={p.status}
                        size="small"
                        color={p.status === "active" ? "success" : "default"}
                        variant="outlined"
                        sx={{ height: 22, fontSize: "0.7rem" }}
                      />
                    </Box>
                  }
                  secondary={`${p.eventCount} event${p.eventCount !== 1 ? "s" : ""}`}
                />
              </ListItemButton>
            ))}
          </List>
        </Card>
      )}
    </Box>
  );
}
