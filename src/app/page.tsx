
import { getFeaturedProjects } from '@/app/projects/actions';
import HomeClient from '@/components/HomeClient';
import type { Project } from '@/app/projects/actions';

export default async function Home() {
  const projects: Project[] = await getFeaturedProjects();
  return <HomeClient projects={projects} />;
}
