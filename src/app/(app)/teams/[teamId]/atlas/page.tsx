import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/connection';
import { TeamModel } from '@/lib/db/models/Team';
import { EventModel } from '@/lib/db/models/Event';
import AtlasClusterManagementClient from './AtlasClusterManagementClient';

export const metadata: Metadata = {
  title: 'Atlas Cluster | MongoHacks',
  description: 'Manage your team\'s MongoDB Atlas cluster',
};

interface PageProps {
  params: Promise<{ teamId: string }>;
}

export default async function AtlasClusterManagementPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  // Await params in Next.js 16
  const { teamId } = await params;

  await connectToDatabase();

  const team = await TeamModel.findById(teamId).lean();
  if (!team) {
    notFound();
  }

  // Check if user is team member
  const isTeamLeader = team.leaderId.toString() === session.user.id;
  const isTeamMember =
    isTeamLeader || team.members.some((m) => m.toString() === session.user.id);
  const isAdmin = ['admin', 'super_admin'].includes(session.user.role);

  if (!isTeamMember && !isAdmin) {
    notFound();
  }

  // Get event and check if Atlas provisioning is enabled
  const event = await EventModel.findById(team.eventId).lean();
  if (!event?.atlasProvisioning?.enabled) {
    notFound();
  }

  return (
    <AtlasClusterManagementClient
      teamId={teamId}
      teamName={team.name}
      eventId={event._id.toString()}
      eventName={event.name}
      isTeamLeader={isTeamLeader}
      isAdmin={isAdmin}
      allowedProviders={event.atlasProvisioning.allowedProviders || ['AWS', 'GCP', 'AZURE']}
    />
  );
}
