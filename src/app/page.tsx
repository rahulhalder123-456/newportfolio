
import { getFeaturedProjects } from '@/app/projects/actions';
import HomeClient from '@/components/HomeClient';
import type { Project } from '@/app/projects/actions';
import { getErrorMessage } from '@/lib/utils';

export default async function Home() {
  let projects: Project[] = [];
  let error: string | null = null;

  try {
    projects = await getFeaturedProjects();
  } catch (e) {
    error = getErrorMessage(e);
  }
  
  return <HomeClient projects={projects} error={error} />;
}
