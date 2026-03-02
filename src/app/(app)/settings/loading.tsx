import { Container } from "@mui/material";
import { FormSkeleton } from "@/components/shared-ui/PageSkeleton";

export default function SettingsLoading() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <FormSkeleton fields={5} />
    </Container>
  );
}
