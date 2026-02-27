import { Container } from "@mui/material";
import { PageHeaderSkeleton, TableSkeleton } from "@/components/shared-ui/PageSkeleton";

export default function AdminEventsLoading() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeaderSkeleton />
      <TableSkeleton rows={6} columns={5} />
    </Container>
  );
}
