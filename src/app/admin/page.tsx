
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, FileCode, Link as LinkIcon, Loader2, Sparkles, Image as ImageIcon, Edit, Trash2, LogOut } from "lucide-react";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingSpinner from "@/components/LoadingSpinner";
import { generateProjectImage } from "@/ai/flows/summarize-project-flow";
import { getErrorMessage } from "@/lib/utils";
import { getProjects, addProject, deleteProject, type Project } from "../projects/actions";

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  summary: z.string().min(10, "Summary must be at least 10 characters."),
  url: z.string().url("Please enter a valid URL."),
  imageUrl: z.string().min(1, "Please generate an image."),
});

export default function AdminPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("isAuthenticated");
    if (isAuthenticated === "true") {
      setIsAuthorized(true);
      loadProjects();
    } else {
      router.replace("/login");
    }
  }, [router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      summary: "",
      url: "",
      imageUrl: "",
    },
  });

  const imageUrlValue = form.watch("imageUrl");
  useEffect(() => {
    setGeneratedImageUrl(imageUrlValue);
  }, [imageUrlValue]);

  async function loadProjects() {
    setIsLoadingProjects(true);
    try {
      const loadedProjects = await getProjects();
      setProjects(loadedProjects);
    } catch (error) {
      console.error("Failed to load projects from database", error);
      toast({
        title: "Error",
        description: "Could not load project data.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProjects(false);
    }
  }

  async function handleDelete(projectId: string) {
    const result = await deleteProject(projectId);
    if (result.success) {
      toast({
        title: "Project Deleted",
        description: "The project has been removed.",
      });
      loadProjects(); // Refresh the list
    } else {
      toast({
        title: "Error",
        description: result.error || "Could not delete the project.",
        variant: "destructive",
      });
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("isAuthenticated");
    router.replace("/login");
  }

  async function handleGenerateImage() {
    const title = form.getValues("title");
    const summary = form.getValues("summary");

    if (!title || !summary) {
        toast({
            title: "Missing Information",
            description: "Please enter a project title and summary first.",
            variant: "destructive",
        });
        return;
    }

    setIsGenerating(true);
    try {
        const result = await generateProjectImage({ title, summary });
        if (result && result.imageUrl) {
            form.setValue("imageUrl", result.imageUrl, { shouldValidate: true });
            setGeneratedImageUrl(result.imageUrl);
            toast({
                title: "Image Generated!",
                description: "The AI-powered image has been created.",
            });
        } else {
            toast({
                title: "Error",
                description: "Could not generate image. Please try again.",
                variant: "destructive",
            });
        }
    } catch (error) {
        toast({
            title: "Generation Failed",
            description: getErrorMessage(error),
            variant: "destructive",
        });
    } finally {
        setIsGenerating(false);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const result = await addProject(values);

    if (result.success) {
      form.reset();
      setGeneratedImageUrl(null);
      toast({
        title: "Project Added!",
        description: "Your new project has been added to the database.",
      });
      loadProjects(); // Refresh the list
    } else {
      toast({
        title: "Error",
        description: result.error || "There was a problem saving your project.",
        variant: "destructive",
      });
    }
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
            <div className="container text-center">
                <LoadingSpinner />
                <p className="text-lg text-muted-foreground animate-pulse">
                    Verifying access...
                </p>
            </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 py-12">
        <section id="add-project" className="w-full">
          <div className="container">
            <div className="mx-auto max-w-2xl">
              <div className="w-full flex justify-end mb-4">
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
              <Card>
                  <CardHeader>
                      <CardTitle>Add a New Creation</CardTitle>
                      <CardDescription>Fill out the form to add your project to the list.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
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
                                <FormItem>
                                    <FormLabel>Project URL</FormLabel>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <FormControl>
                                            <Input placeholder="https://github.com/user/repo" {...field} className="pl-10" />
                                        </FormControl>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                            />
                          </div>
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
                          <Card className="bg-secondary/50">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center justify-between">
                                  Project Image
                                </CardTitle>
                                <CardDescription>
                                  Generate a unique image for your project using AI.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center gap-4">
                               <div className="w-full aspect-[3/2] rounded-md bg-background/50 border border-dashed flex items-center justify-center">
                                {isGenerating ? (
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <Loader2 className="h-8 w-8 animate-spin" />
                                        <span>Generating...</span>
                                    </div>
                                ) : generatedImageUrl ? (
                                    <Image src={generatedImageUrl} alt="Generated project preview" width={600} height={400} className="rounded-md object-contain w-full h-full" />
                                ) : (
                                    <div className="text-center text-muted-foreground p-4">
                                        <ImageIcon className="mx-auto h-12 w-12" />
                                        <p className="mt-2 text-sm">Your generated image will appear here.</p>
                                    </div>
                                )}
                               </div>
                               <FormField
                                control={form.control}
                                name="imageUrl"
                                render={({ field }) => (
                                    <FormItem className="w-full hidden">
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                />
                            </CardContent>
                            <CardFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={handleGenerateImage}
                                    disabled={isGenerating || form.formState.isSubmitting}
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-2 h-4 w-4" />
                                            Generate Image with AI
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                          </Card>
                          
                          <Button type="submit" className="w-full" disabled={isGenerating || form.formState.isSubmitting}>
                              {form.formState.isSubmitting ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                  <PlusCircle className="mr-2 h-4 w-4" />
                              )}
                              Add Project
                          </Button>
                      </form>
                      </Form>
                  </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="manage-projects" className="w-full mt-16">
            <div className="container">
                <div className="mx-auto max-w-2xl">
                    <h3 className="text-2xl font-bold tracking-tighter mb-6 font-headline">Manage Creations</h3>
                    <div className="space-y-4">
                        {isLoadingProjects ? (
                            <div className="text-center text-muted-foreground py-8">
                                <Loader2 className="mx-auto h-8 w-8 animate-spin mb-2" />
                                <p>Loading projects...</p>
                            </div>
                        ) : projects.length > 0 ? (
                            projects.map(project => (
                                <Card key={project.id} className="bg-secondary/50">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <Image src={project.imageUrl} alt={project.title} width={80} height={80} className="rounded-md aspect-[3/2] object-cover" />
                                        <div className="flex-grow overflow-hidden">
                                            <p className="font-semibold truncate">{project.title}</p>
                                            <p className="text-sm text-muted-foreground truncate">{project.url}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button asChild variant="outline" size="icon">
                                                <Link href={`/admin/edit/${encodeURIComponent(project.id)}`}>
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="icon">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete your project from the database.
                                                    </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(project.id)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <p className="text-muted-foreground text-center py-8">No projects have been added yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
