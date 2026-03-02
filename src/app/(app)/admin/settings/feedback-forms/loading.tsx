import { Container } from "@mui/material";
import { PageHeaderSkeleton, TableSkeleton } from "@/components/shared-ui/PageSkeleton";

export default function FeedbackFormsLoading() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeaderSkeleton />
      <TableSkeleton rows={5} columns={3} />
    </Container>
  );
}
