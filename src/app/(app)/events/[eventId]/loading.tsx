import { Container } from "@mui/material";
import { PageHeaderSkeleton, DetailSkeleton } from "@/components/shared-ui/PageSkeleton";

export default function EventDetailLoading() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeaderSkeleton />
      <DetailSkeleton />
    </Container>
  );
}
