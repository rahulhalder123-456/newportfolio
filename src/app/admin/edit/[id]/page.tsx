
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, FileCode, Link as LinkIcon, Loader2, Sparkles, Image as ImageIcon, ArrowLeft } from "lucide-react";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingSpinner from "@/components/LoadingSpinner";
import { generateProjectImage } from "@/ai/flows/summarize-project-flow";
import { getErrorMessage } from "@/lib/utils";

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  summary: z.string().min(10, "Summary must be at least 10 characters."),
  url: z.string().url("Please enter a valid URL."),
  imageUrl: z.string().url("Please generate or provide an image.").min(1, "Please provide an image."),
});

type Project = {
  id: string;
  url: string;
  title: string;
  summary: string;
  imageUrl: string;
};

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      summary: "",
      url: "",
      imageUrl: "",
    },
  });

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("isAuthenticated");
    if (isAuthenticated !== "true") {
      router.replace("/login");
      return;
    }
    setIsAuthorized(true);

    if (projectId) {
        try {
            const storedProjects = localStorage.getItem("projects");
            const projects: Project[] = storedProjects ? JSON.parse(storedProjects) : [];
            const projectToEdit = projects.find(p => p.id === projectId);
            if (projectToEdit) {
                form.reset(projectToEdit);
                setGeneratedImageUrl(projectToEdit.imageUrl);
            } else {
                toast({ title: "Error", description: "Project not found.", variant: "destructive" });
                router.replace("/admin");
            }
        } catch (error) {
            toast({ title: "Error", description: "Could not load project data.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }
  }, [router, projectId, form, toast]);

  const imageUrlValue = form.watch("imageUrl");
  useEffect(() => {
    setGeneratedImageUrl(imageUrlValue);
  }, [imageUrlValue]);


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
                description: "The AI-powered image has been re-created.",
            });
        } else {
            toast({ title: "Error", description: "Could not generate image. Please try again.", variant: "destructive" });
        }
    } catch (error) {
        toast({ title: "Generation Failed", description: getErrorMessage(error), variant: "destructive" });
    } finally {
        setIsGenerating(false);
    }
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    const updatedProject: Project = {
      id: projectId,
      ...values,
    };

    try {
        const storedProjects = localStorage.getItem("projects");
        const projects: Project[] = storedProjects ? JSON.parse(storedProjects) : [];
        const projectIndex = projects.findIndex(p => p.id === projectId);
        
        if (projectIndex > -1) {
            projects[projectIndex] = updatedProject;
            localStorage.setItem("projects", JSON.stringify(projects));
            toast({ title: "Project Updated!", description: "Your changes have been saved." });
            router.push("/admin");
        } else {
            toast({ title: "Error", description: "Could not find project to update.", variant: "destructive" });
        }
    } catch (error) {
        toast({ title: "Error", description: "There was a problem saving your project.", variant: "destructive" });
    }
  }

  if (!isAuthorized || isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
            <div className="container text-center">
                <LoadingSpinner />
                <p className="text-lg text-muted-foreground animate-pulse">
                    Loading project...
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
        <section id="edit-project" className="w-full">
          <div className="container">
            <div className="mx-auto max-w-2xl">
              <div className="mb-4">
                <Button asChild variant="outline" size="sm">
                    <Link href="/admin">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Admin
                    </Link>
                </Button>
              </div>
              <Card>
                  <CardHeader>
                      <CardTitle>Edit Creation</CardTitle>
                      <CardDescription>Update the details of your project below.</CardDescription>
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
                                    <Image src={generatedImageUrl} alt="Generated project preview" width={600} height={400} className="rounded-md object-cover w-full h-full" />
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
                                            Generate New Image
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                          </Card>
                          
                          <Button type="submit" className="w-full" disabled={isGenerating}>
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
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

    