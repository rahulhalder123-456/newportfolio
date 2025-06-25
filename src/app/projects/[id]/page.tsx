import { getProject } from "@/app/projects/actions";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = await getProject(decodeURIComponent(params.id));

  if (!project) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 py-12 md:py-24">
        <div className="container">
          <div className="mb-8">
            <Button asChild variant="outline" size="sm">
              <Link href="/projects">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to All Projects
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-5 gap-8 lg:gap-12 items-start">
            <div className="md:col-span-3 aspect-[3/2] w-full overflow-hidden rounded-lg border bg-black/20">
              <Image
                src={project.imageUrl}
                alt={`Image for ${project.title}`}
                width={1200}
                height={800}
                className="object-contain w-full h-full"
              />
            </div>
            <div className="md:col-span-2 space-y-6">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tighter font-headline">{project.title}</h1>
              <p className="text-muted-foreground text-base whitespace-pre-wrap leading-relaxed">{project.summary}</p>
              <Button asChild size="lg" className="w-full">
                <a href={project.url} target="_blank" rel="noopener noreferrer">
                  View Project <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
