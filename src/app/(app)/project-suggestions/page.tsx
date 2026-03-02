import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { Container } from '@mui/material';
import { auth } from '@/lib/auth';
import { PageHeaderSkeleton, FormSkeleton } from '@/components/shared-ui/PageSkeleton';
import ProjectSuggestionWizard from './ProjectSuggestionWizard';

export const metadata = {
  title: 'AI Project Suggestions | MongoHacks',
  description: 'Get AI-powered project ideas for your hackathon',
};

export default async function ProjectSuggestionsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login?callbackUrl=/project-suggestions');
  }

  return (
    <Suspense fallback={<Container maxWidth="md" sx={{ py: 4 }}><PageHeaderSkeleton /><FormSkeleton fields={4} /></Container>}>
      <ProjectSuggestionWizard userId={session.user.id} />
    </Suspense>
  );
}
