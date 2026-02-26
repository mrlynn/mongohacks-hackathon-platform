import { Box, Typography, Chip, Button } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { connectToDatabase } from "@/lib/db/connection";
import { UserModel } from "@/lib/db/models/User";
import { EventModel } from "@/lib/db/models/Event";
import { JudgeAssignmentModel } from "@/lib/db/models/JudgeAssignment";
import { serializeDocs } from "@/lib/utils/serialize";
import JudgesView from "./JudgesView";
import Link from "next/link";

async function getJudgesData() {
  await connectToDatabase();

  const judges = await UserModel.find({ role: "judge" })
    .select("-passwordHash")
    .sort({ createdAt: -1 })
    .lean();

  // Get all events (for direct linking to judging pages)
  const events = await EventModel.find({
    status: { $in: ["open", "in_progress"] },
  })
    .select("name status startDate")
    .sort({ startDate: -1 })
    .lean();

  // Get assignment counts per judge
  const assignmentCounts = await JudgeAssignmentModel.aggregate([
    { $group: { _id: "$judgeId", count: { $sum: 1 } } },
  ]);

  const assignmentCountMap: Record<string, number> = {};
  for (const item of assignmentCounts) {
    assignmentCountMap[item._id.toString()] = item.count;
  }

  return {
    judges: serializeDocs(judges),
    events: serializeDocs(events),
    assignmentCountMap,
  };
}

export default async function AdminJudgesPage() {
  const { judges, events, assignmentCountMap } = await getJudgesData();

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
          href="/admin/users"
          sx={{ fontWeight: 600 }}
        >
          Assign Judge Role
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Chip label={`${judges.length} Active Judges`} color="info" />
      </Box>

      <JudgesView
        judges={judges}
        events={events}
        assignmentCountMap={assignmentCountMap}
      />
    </Box>
  );
}
