
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, FileCode, Link } from "lucide-react";
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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

export default function AdminPage() {
  const { toast } = useToast();

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
      ...values,
    };

    const storedProjects = localStorage.getItem("projects");
    const projects = storedProjects ? JSON.parse(storedProjects) : [];
    const updatedProjects = [newProject, ...projects];
    
    localStorage.setItem("projects", JSON.stringify(updatedProjects));
    
    form.reset();

    toast({
      title: "Project Added!",
      description: "Your new project has been added to the list.",
    });
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <section id="add-project" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-2xl">
              <Card>
                  <CardHeader>
                      <CardTitle>Add a New Creation</CardTitle>
                      <CardDescription>Fill out the form to add your project to the list.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                              <FormItem className="md:col-span-1">
                                  <FormLabel>Project Title</FormLabel>
                                  <div className="relative">
                                      <FileCode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                      <FormControl>
                                          <Input placeholder="My Awesome Project" {...field} className="pl-10" />
                                      </FormControl>
                                  </div>
                                  <FormMessage />
                              </FormItem>
                          )}
                          />
                          <FormField
                          control={form.control}
                          name="url"
                          render={({ field }) => (
                              <FormItem className="md:col-span-1">
                                  <FormLabel>Project URL</FormLabel>
                                  <div className="relative">
                                      <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                      <FormControl>
                                          <Input placeholder="https://github.com/user/repo" {...field} className="pl-10" />
                                      </FormControl>
                                  </div>
                                  <FormMessage />
                              </FormItem>
                          )}
                          />
                          <FormField
                          control={form.control}
                          name="summary"
                          render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                  <FormLabel>Summary</FormLabel>
                                  <FormControl>
                                  <Textarea placeholder="A short description of the project..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )}
                          />
                          <Button type="submit" className="w-full md:col-span-2">
                              <PlusCircle className="mr-2 h-4 w-4" />
                              Add Project
                          </Button>
                      </form>
                      </Form>
                  </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
