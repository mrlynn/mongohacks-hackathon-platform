import { Container, Skeleton, Box, Card, CardContent, Grid } from "@mui/material";

export default function ResultsLoading() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Skeleton variant="text" width={160} height={32} sx={{ mb: 2 }} />
      <Skeleton variant="rounded" width="100%" height={200} sx={{ borderRadius: 2, mb: 4 }} />

      {/* Top 3 podium skeletons */}
      <Skeleton variant="text" width={200} height={36} sx={{ mb: 3, mx: "auto" }} />
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {[1, 2, 3].map((i) => (
          <Grid key={i} size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent sx={{ textAlign: "center", py: 4 }}>
                <Skeleton variant="circular" width={60} height={60} sx={{ mx: "auto", mb: 2 }} />
                <Skeleton variant="text" width="60%" height={40} sx={{ mx: "auto" }} />
                <Skeleton variant="text" width="40%" height={24} sx={{ mx: "auto" }} />
                <Skeleton variant="text" width="50%" height={48} sx={{ mx: "auto", mt: 2 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Leaderboard skeleton */}
      <Skeleton variant="text" width={200} height={36} sx={{ mb: 2 }} />
      <Card>
        <CardContent>
          {Array.from({ length: 6 }).map((_, i) => (
            <Box key={i} sx={{ display: "flex", gap: 2, mb: 1.5 }}>
              <Skeleton variant="text" width="5%" height={24} />
              <Skeleton variant="text" width="25%" height={24} />
              <Skeleton variant="text" width="15%" height={24} />
              <Skeleton variant="text" width="10%" height={24} />
              <Skeleton variant="text" width="10%" height={24} />
              <Skeleton variant="text" width="10%" height={24} />
              <Skeleton variant="text" width="10%" height={24} />
            </Box>
          ))}
        </CardContent>
      </Card>
    </Container>
  );
}
