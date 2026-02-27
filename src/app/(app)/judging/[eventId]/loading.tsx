import { Container, Skeleton, Box, Card, CardContent, Grid } from "@mui/material";

export default function JudgingDashboardLoading() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Skeleton variant="text" width={160} height={32} sx={{ mb: 2 }} />
      <Skeleton variant="text" width="40%" height={40} sx={{ mb: 1 }} />
      <Skeleton variant="rounded" width="100%" height={12} sx={{ mb: 4, borderRadius: 1 }} />

      <Grid container spacing={3}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                  <Skeleton variant="text" width="60%" height={28} />
                  <Skeleton variant="rounded" width={70} height={24} />
                </Box>
                <Skeleton variant="text" width="100%" height={18} />
                <Skeleton variant="text" width="80%" height={18} />
                <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                  <Skeleton variant="rounded" width={50} height={24} />
                  <Skeleton variant="rounded" width={50} height={24} />
                </Box>
                <Skeleton variant="rounded" width="100%" height={36} sx={{ mt: 2 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
