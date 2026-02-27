import { connectToDatabase } from "@/lib/db/connection";
import { FeedbackFormConfigModel } from "@/lib/db/models/FeedbackFormConfig";
import { EventModel } from "@/lib/db/models/Event";
import { Box, Typography, Alert } from "@mui/material";
import FeedbackFormRenderer from "./FeedbackFormRenderer";

interface PageProps {
  params: Promise<{ formId: string }>;
  searchParams: Promise<{ eventId?: string }>;
}

export default async function FeedbackFormPage({
  params,
  searchParams,
}: PageProps) {
  const { formId } = await params;
  const { eventId } = await searchParams;

  await connectToDatabase();

  const form = await FeedbackFormConfigModel.findById(formId).lean();

  if (!form) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="error">Feedback form not found.</Alert>
      </Box>
    );
  }

  let eventName = "";
  if (eventId) {
    const event = await EventModel.findById(eventId)
      .select("name")
      .lean();
    if (event) {
      eventName = (event as { name: string }).name;
    }
  }

  const formData = JSON.parse(JSON.stringify(form));

  return (
    <Box>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          {formData.name}
        </Typography>
        {eventName && (
          <Typography variant="h6" color="text.secondary">
            {eventName}
          </Typography>
        )}
        {formData.description && (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            {formData.description}
          </Typography>
        )}
      </Box>
      <FeedbackFormRenderer
        form={formData}
        eventId={eventId || ""}
      />
    </Box>
  );
}
