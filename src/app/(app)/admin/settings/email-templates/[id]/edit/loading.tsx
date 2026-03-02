import { Container } from "@mui/material";
import { PageHeaderSkeleton, FormSkeleton } from "@/components/shared-ui/PageSkeleton";

export default function EditEmailTemplateLoading() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <PageHeaderSkeleton />
      <FormSkeleton fields={5} />
    </Container>
  );
}
