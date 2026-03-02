import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { Container } from '@mui/material';
import { auth } from '@/lib/auth';
import { PageHeaderSkeleton, CardGridSkeleton } from '@/components/shared-ui/PageSkeleton';
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
    <Suspense fallback={<Container maxWidth="lg" sx={{ py: 4 }}><PageHeaderSkeleton /><CardGridSkeleton count={4} /></Container>}>
      <SavedIdeasView userId={session.user.id} />
    </Suspense>
  );
}
