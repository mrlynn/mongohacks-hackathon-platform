import { Box, Typography, Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { connectToDatabase } from "@/lib/db/connection";
import { UserModel } from "@/lib/db/models/User";

async function getJudges() {
  await connectToDatabase();
  const judges = await UserModel.find({ role: "judge" })
    .select("-passwordHash")
    .sort({ createdAt: -1 })
    .lean();

  return judges.map((judge) => ({
    ...judge,
    _id: judge._id.toString(),
    createdAt: judge.createdAt.toISOString(),
  }));
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
          sx={{ fontWeight: 600 }}
        >
          Assign Judge
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Chip label={`${judges.length} Active Judges`} color="info" />
      </Box>

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.50" }}>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Assigned Projects</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {judges.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  No judges assigned yet. Promote users to judge role to get started.
                </TableCell>
              </TableRow>
            ) : (
              judges.map((judge) => (
                <TableRow key={judge._id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{judge.name}</TableCell>
                  <TableCell>{judge.email}</TableCell>
                  <TableCell>
                    {new Date(judge.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip label="0 projects" size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" variant="outlined">
                      Manage Assignments
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
