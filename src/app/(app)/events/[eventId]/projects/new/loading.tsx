import { Container } from "@mui/material";
import { PageHeaderSkeleton, FormSkeleton } from "@/components/shared-ui/PageSkeleton";

export default function NewProjectLoading() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <PageHeaderSkeleton />
      <FormSkeleton fields={6} />
    </Container>
  );
}
