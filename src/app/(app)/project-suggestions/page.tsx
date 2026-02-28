import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
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
    <Suspense fallback={<div>Loading...</div>}>
      <ProjectSuggestionWizard userId={(session.user as any).id} />
    </Suspense>
  );
}
