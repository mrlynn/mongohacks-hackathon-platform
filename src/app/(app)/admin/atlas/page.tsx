import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AdminAtlasClient from './AdminAtlasClient';

export const metadata: Metadata = {
  title: 'Atlas Cluster Management | Admin',
  description: 'Manage all Atlas clusters across events',
};

export default async function AdminAtlasPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  if (!['admin', 'super_admin'].includes((session.user as any).role)) {
    redirect('/dashboard');
  }

  return <AdminAtlasClient />;
}
