import { Box, Typography, Chip, Button } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { connectToDatabase } from "@/lib/db/connection";
import { UserModel } from "@/lib/db/models/User";
import { serializeDocs } from "@/lib/utils/serialize";
import JudgesView from "./JudgesView";
import Link from "next/link";

async function getJudges() {
  await connectToDatabase();
  const judges = await UserModel.find({ role: "judge" })
    .select("-passwordHash")
    .sort({ createdAt: -1 })
    .lean();

  return serializeDocs(judges);
}

export default async function AdminJudgesPage() {
  const judges = await getJudges();

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Judges Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage judges and assignments
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={Link}
          href="/admin/users"
          sx={{ fontWeight: 600 }}
        >
          Assign Judge
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Chip label={`${judges.length} Active Judges`} color="info" />
      </Box>

      <JudgesView judges={judges} />
    </Box>
  );
}
