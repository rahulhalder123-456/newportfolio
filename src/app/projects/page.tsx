
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Projects from '@/components/Projects';
import { getProjects, type Project } from '@/app/projects/actions';

export default async function ProjectsPage() {
  const projects: Project[] = await getProjects();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 py-12 md:py-24 lg:py-32">
        <Projects
          projects={projects}
          isLoading={false} // Data is pre-fetched on the server
          title="All Creations"
          description="Here is a complete list of my projects."
          showViewAllButton={false}
        />
      </main>
      <Footer />
    </div>
  );
}
