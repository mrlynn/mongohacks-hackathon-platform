import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Box, Container, CircularProgress, Alert } from "@mui/material";
import EventHubContent from "./EventHubContent";

async function getHubData(eventId: string) {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/events/${eventId}/hub`, {
      headers: {
        Cookie: `authjs.session-token=${(session as any).sessionToken}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const error = await res.json();
      return { error: error.message || "Failed to load hub data" };
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching hub data:", error);
    return { error: "Failed to connect to server" };
  }
}

export default async function EventHubPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { eventId } = await params;
  const data = await getHubData(eventId);

  if (!data) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Failed to load hub data</Alert>
      </Container>
    );
  }

  if (data.error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{data.error}</Alert>
      </Container>
    );
  }

  return (
    <Suspense
      fallback={
        <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
          <CircularProgress />
        </Container>
      }
    >
      <EventHubContent data={data} eventId={eventId} />
    </Suspense>
  );
}
