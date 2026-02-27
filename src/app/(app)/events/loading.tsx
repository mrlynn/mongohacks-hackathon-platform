import { Container } from "@mui/material";
import { PageHeaderSkeleton, CardGridSkeleton } from "@/components/shared-ui/PageSkeleton";

export default function EventsLoading() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeaderSkeleton />
      <CardGridSkeleton count={6} />
    </Container>
  );
}
