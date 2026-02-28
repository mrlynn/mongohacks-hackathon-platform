import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import SavedIdeasView from './SavedIdeasView';

export const metadata = {
  title: 'Saved Project Ideas | MongoHacks',
  description: 'View your saved hackathon project ideas',
};

export default async function SavedIdeasPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login?callbackUrl=/project-suggestions/saved');
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SavedIdeasView userId={(session.user as any).id} />
    </Suspense>
  );
}
