import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/connection';
import { TeamModel } from '@/lib/db/models/Team';
import { errorResponse } from '@/lib/utils';
import { Types } from 'mongoose';

/**
 * Require that the authenticated user is the leader of the specified team.
 * Admins and super_admins bypass this check.
 */
export async function requireTeamLeader(teamId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw errorResponse('Authentication required', 401);
  }

  // Admins bypass team leader check
  if (['admin', 'super_admin'].includes(session.user.role)) {
    return session;
  }

  await connectToDatabase();
  const team = await TeamModel.findById(teamId);
  if (!team) {
    throw errorResponse('Team not found', 404);
  }

  if (team.leader.toString() !== session.user.id) {
    throw errorResponse('Only the team leader can perform this action', 403);
  }

  return session;
}

/**
 * Require that the authenticated user is a member of the specified team.
 * Team members include the leader and all other members.
 * Admins and super_admins bypass this check.
 */
export async function requireTeamMember(teamId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw errorResponse('Authentication required', 401);
  }

  // Admins bypass team member check
  if (['admin', 'super_admin'].includes(session.user.role)) {
    return session;
  }

  await connectToDatabase();
  const team = await TeamModel.findById(teamId);
  if (!team) {
    throw errorResponse('Team not found', 404);
  }

  const isMember =
    team.leader.toString() === session.user.id ||
    team.members.some((m: Types.ObjectId) => m.toString() === session.user.id);

  if (!isMember) {
    throw errorResponse('You must be a team member to view this', 403);
  }

  return session;
}
