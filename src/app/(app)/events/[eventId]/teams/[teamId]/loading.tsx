import { Container } from "@mui/material";
import { DetailSkeleton } from "@/components/shared-ui/PageSkeleton";

export default function TeamDetailLoading() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <DetailSkeleton />
    </Container>
  );
}
