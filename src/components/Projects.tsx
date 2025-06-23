"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { summarizeGithubRepo } from "@/ai/flows/summarize-github-repo";
import { Loader2, Wand2 } from "lucide-react";
import ProjectCard from "./ProjectCard";

const formSchema = z.object({
  repoUrl: z.string().url("Please enter a valid GitHub repository URL."),
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
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      repoUrl: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const result = await summarizeGithubRepo({ repoUrl: values.repoUrl });
      
      const newProject: Project = {
        id: new Date().toISOString(),
        url: values.repoUrl,
        title: result.title,
        summary: result.summary,
      };

      setProjects(prevProjects => [newProject, ...prevProjects]);
      form.reset();

      const isErrorSummary = result.summary.toLowerCase().includes('unable') || result.summary.toLowerCase().includes('failed') || result.summary.toLowerCase().includes('error');

      if (!isErrorSummary) {
        toast({
          title: "Project Added!",
          description: "The repository has been summarized and added to your list.",
        });
      }
    } catch (error) {
      console.error("Error summarizing repository:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to summarize the repository. Please check the URL and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section id="projects" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">My Creations</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Here are some of my projects. Add a new one by pasting a GitHub repository link below.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-xl my-12">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
              <FormField
                control={form.control}
                name="repoUrl"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Input placeholder="https://github.com/your-name/your-repo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-40">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Summarize
              </Button>
            </form>
          </Form>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
          {projects.map((project) => (
            <ProjectCard key={project.id} {...project} />
          ))}
        </div>
        {projects.length === 0 && !isLoading && (
            <div className="text-center col-span-full py-12">
                <p className="text-muted-foreground">No projects yet. Add one above to get started!</p>
            </div>
        )}
      </div>
    </section>
  );
}
