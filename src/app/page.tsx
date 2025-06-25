
import { getProjects } from '@/app/projects/actions';
import HomeClient from '@/components/HomeClient';
import type { Project } from '@/app/projects/actions';

export default async function Home() {
  const projects: Project[] = await getProjects();
  return <HomeClient projects={projects} />;
}
