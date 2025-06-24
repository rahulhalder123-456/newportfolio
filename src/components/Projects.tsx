"use client";

import { useState, useEffect } from "react";
import ProjectCard from "./ProjectCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Project = {
  id: string;
  url: string;
  title: string;
  summary: string;
  imageUrl: string;
};

type ProjectsProps = {
  limit?: number;
  showViewAllButton?: boolean;
  title?: string;
  description?: string;
  className?: string;
};

export default function Projects({
  limit,
  showViewAllButton = false,
  title = "My Creations",
  description = "Here are some of the projects I've been working on.",
  className,
}: ProjectsProps) {
  const [allProjects, setAllProjects] = useState<Project[]>([]);

  useEffect(() => {
    try {
      const storedProjects = localStorage.getItem("projects");
      if (storedProjects) {
        setAllProjects(JSON.parse(storedProjects));
      }
    } catch (error) {
      console.error("Failed to parse projects from localStorage", error);
    }
  }, []);

  const projectsToDisplay = limit ? allProjects.slice(0, limit) : allProjects;

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
          {projectsToDisplay.length > 0 ? (
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

        {showViewAllButton && limit && allProjects.length > limit && (
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
