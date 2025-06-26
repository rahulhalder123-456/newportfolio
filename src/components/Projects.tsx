
"use client";

import ProjectCard from "./ProjectCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Project } from "@/app/projects/actions";

type ProjectsProps = {
  projects: Project[];
  isLoading?: boolean;
  limit?: number;
  showViewAllButton?: boolean;
  title?: string;
  description?: string;
  className?: string;
  error?: string | null;
};

export default function Projects({
  projects = [],
  isLoading = false,
  limit,
  showViewAllButton = false,
  title = "My Creations",
  description = "Here are some of the projects I've been working on.",
  className,
  error = null,
}: ProjectsProps) {
  const projectsToDisplay = limit ? projects.slice(0, limit) : projects;

  return (
    <section id="projects" className={cn("w-full text-center", className)}>
      <div className="container">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">{title}</h2>
          <p className="mx-auto max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            {description}
          </p>
        </div>

        <div className="mt-12">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="py-12 text-left max-w-3xl mx-auto">
                <div className="bg-destructive/10 border-l-4 border-destructive text-destructive-foreground p-4 rounded-md flex items-start gap-4" role="alert">
                    <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="font-bold">Error Loading Projects</h3>
                        <p className="text-sm mt-1">{error}</p>
                        <p className="text-xs mt-2 text-muted-foreground">
                            This typically happens when environment variables (like API keys) are not set up correctly on the hosting server. Please double-check your project's configuration.
                        </p>
                    </div>
                </div>
            </div>
          ) : projectsToDisplay.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 text-left">
              {projectsToDisplay.map((project) => (
                <ProjectCard key={project.id} {...project} />
              ))}
            </div>
          ) : (
            <div className="py-12">
              <p className="text-muted-foreground">No projects have been added yet. Check back soon!</p>
            </div>
          )}
        </div>

        {showViewAllButton && !isLoading && !error && projectsToDisplay.length > 0 && (
          <div className="mt-12 text-center">
            <Button asChild>
              <Link href="/projects">
                View All Projects <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
