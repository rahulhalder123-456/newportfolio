"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";
import ProjectCard from "./ProjectCard";

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  summary: z.string().min(10, "Summary must be at least 10 characters."),
  url: z.string().url("Please enter a valid URL."),
});

type Project = {
  id: string;
  url: string;
  title: string;
  summary: string;
};

export default function Projects() {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      summary: "",
      url: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newProject: Project = {
      id: new Date().toISOString(),
      url: values.url,
      title: values.title,
      summary: values.summary,
    };

    setProjects(prevProjects => [newProject, ...prevProjects]);
    form.reset();

    toast({
      title: "Project Added!",
      description: "Your new project has been added to the list.",
    });
  }

  return (
    <section id="projects" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">My Creations</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Here are some of my projects. Add a new one using the form below.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-xl my-12">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title</FormLabel>
                    <FormControl>
                      <Input placeholder="My Awesome Project" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://github.com/your-name/your-repo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Summary</FormLabel>
                    <FormControl>
                      <Textarea placeholder="A short description of the project..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Project
              </Button>
            </form>
          </Form>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
          {projects.map((project) => (
            <ProjectCard key={project.id} {...project} />
          ))}
        </div>
        {projects.length === 0 && (
            <div className="text-center col-span-full py-12">
                <p className="text-muted-foreground">No projects yet. Add one above to get started!</p>
            </div>
        )}
      </div>
    </section>
  );
}
