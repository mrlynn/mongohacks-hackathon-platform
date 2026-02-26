import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/connection";
import { EventModel } from "@/lib/db/models/Event";
import { ParticipantModel } from "@/lib/db/models/Participant";
import { serializeDoc } from "@/lib/utils/serialize";
import RegistrationClient from "./RegistrationClient";
import { Container, Alert } from "@mui/material";

async function getEventData(eventId: string, userId?: string) {
  await connectToDatabase();

  const event = await EventModel.findById(eventId).lean();
  if (!event) {
    return { error: "Event not found" };
  }

  // Check if event is open for registration
  const now = new Date();
  if (event.registrationDeadline && now > new Date(event.registrationDeadline)) {
    return { error: "Registration deadline has passed" };
  }

  // If user is logged in, check if already registered
  let alreadyRegistered = false;
  if (userId) {
    const participant = await ParticipantModel.findOne({
      userId,
      "registeredEvents.eventId": eventId,
    });
    alreadyRegistered = !!participant;
  }

  // Check capacity
  const registeredCount = await ParticipantModel.countDocuments({
    "registeredEvents.eventId": eventId,
  });

  const spotsRemaining = event.capacity ? event.capacity - registeredCount : null;
  const isFull = spotsRemaining !== null && spotsRemaining <= 0;

  return {
    event: serializeDoc(event),
    alreadyRegistered,
    registeredCount,
    spotsRemaining,
    isFull,
  };
}

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const session = await auth();
  const { eventId } = await params;
  const userId = session?.user ? (session.user as { id: string }).id : undefined;

  const data = await getEventData(eventId, userId);

  if ("error" in data) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{data.error}</Alert>
      </Container>
    );
  }

  // If already registered, redirect to hub
  if (data.alreadyRegistered) {
    redirect(`/events/${eventId}/hub`);
  }

  // If event is full, show error
  if (data.isFull) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          This event is at full capacity ({data.event.capacity} participants).
        </Alert>
      </Container>
    );
  }

  return (
    <RegistrationClient
      event={data.event}
      eventId={eventId}
      registeredCount={data.registeredCount}
      spotsRemaining={data.spotsRemaining}
      isLoggedIn={!!session?.user}
      userEmail={session?.user?.email ?? undefined}
      userName={session?.user?.name ?? undefined}
    />
  );
}
