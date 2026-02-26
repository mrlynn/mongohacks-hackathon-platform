import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Container, Alert } from "@mui/material";
import ResultsClient from "./ResultsClient";

async function getResults(eventId: string, isAdmin: boolean) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/events/${eventId}/results`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return { error: "Failed to fetch results" };
    }

    const data = await response.json();

    // If results not published and user is not admin, hide them
    if (!data.event.resultsPublished && !isAdmin) {
      return { error: "Results have not been published yet" };
    }

    return data;
  } catch (error) {
    console.error("Error fetching results:", error);
    return { error: "Failed to load results" };
  }
}

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const session = await auth();
  const { eventId } = await params;
  
  const userRole = session?.user ? (session.user as { role?: string }).role : null;
  const isAdmin = ["admin", "organizer"].includes(userRole || "");

  const data = await getResults(eventId, isAdmin);

  if (data.error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">{data.error}</Alert>
      </Container>
    );
  }

  return <ResultsClient {...data} eventId={eventId} isAdmin={isAdmin} />;
}
