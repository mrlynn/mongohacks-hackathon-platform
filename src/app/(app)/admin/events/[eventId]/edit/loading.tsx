import { Container } from "@mui/material";
import { FormSkeleton } from "@/components/shared-ui/PageSkeleton";

export default function EditEventLoading() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <FormSkeleton fields={8} />
    </Container>
  );
}
