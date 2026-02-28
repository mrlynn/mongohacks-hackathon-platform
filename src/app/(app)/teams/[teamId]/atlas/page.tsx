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
  params: { teamId: string };
}

export default async function AtlasClusterManagementPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  await connectToDatabase();

  const team = await TeamModel.findById(params.teamId).populate('event').lean();
  if (!team) {
    notFound();
  }

  // Check if user is team member
  const isTeamLeader = team.leader.toString() === session.user.id;
  const isTeamMember =
    isTeamLeader || team.members.some((m) => m.toString() === session.user.id);
  const isAdmin = ['admin', 'super_admin'].includes(session.user.role);

  if (!isTeamMember && !isAdmin) {
    notFound();
  }

  // Get event and check if Atlas provisioning is enabled
  const event = await EventModel.findById(team.event).lean();
  if (!event?.atlasProvisioning?.enabled) {
    notFound();
  }

  const project = team.project
    ? { _id: team.project.toString(), name: team.name }
    : null;

  return (
    <AtlasClusterManagementClient
      teamId={params.teamId}
      eventId={team.event.toString()}
      projectId={project?._id || ''}
      teamName={team.name}
      eventName={event.name}
      isTeamLeader={isTeamLeader || isAdmin}
    />
  );
}
