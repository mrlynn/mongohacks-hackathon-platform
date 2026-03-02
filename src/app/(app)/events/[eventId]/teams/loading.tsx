import { Container } from "@mui/material";
import { PageHeaderSkeleton, CardGridSkeleton } from "@/components/shared-ui/PageSkeleton";

export default function TeamsLoading() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeaderSkeleton />
      <CardGridSkeleton count={4} />
    </Container>
  );
}
