
"use client";

import { useState, useEffect } from "react";
import ProjectCard from "./ProjectCard";

type Project = {
  id: string;
  url: string;
  title: string;
  summary: string;
};

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    try {
      const storedProjects = localStorage.getItem("projects");
      if (storedProjects) {
        setProjects(JSON.parse(storedProjects));
      }
    } catch (error) {
      console.error("Failed to parse projects from localStorage", error);
    }
  }, []);

  return (
    <section id="projects" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container text-center">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">My Creations</h2>
          <p className="mx-auto max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Here are some of the projects I've been working on.
          </p>
        </div>

        <div className="mt-12">
          {projects.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 text-left">
              {projects.map((project) => (
                <ProjectCard key={project.id} {...project} />
              ))}
            </div>
          ) : (
            <div className="py-12">
              <p className="text-muted-foreground">No projects have been added yet. Check back soon!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
