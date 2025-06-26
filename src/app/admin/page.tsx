
'use client';

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  PlusCircle,
  FileCode,
  Link as LinkIcon,
  Loader2,
  Sparkles,
  Image as ImageIcon,
  Edit,
  Trash2,
  LogOut,
  Star,
  Upload,
} from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoadingSpinner from "@/components/LoadingSpinner";
import { cn } from "@/lib/utils";
import { generateProjectImage } from "@/ai/flows/summarize-project-flow";
import { getErrorMessage } from "@/lib/utils";
import { compressImage } from "@/lib/client-utils";
import {
  getProjects,
  addProject,
  deleteProject,
  toggleProjectFeatured,
  type Project,
} from "../projects/actions";

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  summary: z.string().min(10, "Summary must be at least 10 characters."),
  url: z.string().url("Please enter a valid URL."),
  imageUrl: z.string().optional(),
  featured: z.boolean().default(false),
});

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      summary: "",
      url: "",
      imageUrl: "",
      featured: false,
    },
  });

  const loadProjects = useCallback(async () => {
    setIsLoadingProjects(true);
    try {
      const loaded = await getProjects();
      setProjects(loaded);
    } catch (error) {
      toast({
        title: "Error Loading Projects",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsLoadingProjects(false);
    }
  }, [toast]);

  useEffect(() => {
    const auth = sessionStorage.getItem("isAuthenticated");
    if (auth === "true") {
      setIsAuthorized(true);
      loadProjects();
    } else {
      router.replace("/login");
    }
  }, [router, loadProjects]);

  const imageUrlValue = form.watch("imageUrl");
  useEffect(() => {
    setGeneratedImageUrl(imageUrlValue || null);
  }, [imageUrlValue]);

  const handleDelete = async (projectId: string) => {
    const result = await deleteProject(projectId);
    if (result.success) {
      toast({
        title: "Project Deleted",
        description: "The project has been removed.",
      });
      await loadProjects();
    } else {
      toast({
        title: "Error",
        description: result.error || "Could not delete the project.",
        variant: "destructive",
      });
    }
  };

  const handleToggleFeatured = async (projectId: string, currentStatus: boolean) => {
    const result = await toggleProjectFeatured(projectId, !currentStatus);
    if (result.success) {
      toast({
        title: "Project Updated",
        description: `Project has been ${!currentStatus ? 'featured' : 'unfeatured'}.`,
      });
      await loadProjects();
    } else {
      toast({
        title: "Error",
        description: result.error || "Could not update the project.",
        variant: "destructive",
      });
    }
  };


  const handleLogout = () => {
    sessionStorage.removeItem("isAuthenticated");
    router.replace("/login");
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
          try {
            const compressed = await compressImage(dataUrl);
            form.setValue("imageUrl", compressed, { shouldValidate: true });
            toast({
              title: "Image Uploaded!",
              description: "Your image is ready to be saved with the project.",
            });
          } catch (error) {
             toast({
              title: "Image Processing Failed",
              description: getErrorMessage(error),
              variant: "destructive",
            });
          }
        }
      };
      reader.onerror = () => {
        toast({
          title: "File Read Error",
          description: "Could not read the selected file.",
          variant: "destructive",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateImage = async () => {
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
      if (result?.imageUrl) {
        const compressed = await compressImage(result.imageUrl);
        form.setValue("imageUrl", compressed, { shouldValidate: true });
        setGeneratedImageUrl(compressed);
        toast({
          title: "Image Generated!",
          description: "The AI-powered image has been created.",
        });
      } else {
        throw new Error("The AI model did not return an image.");
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      let userFriendlyMessage = errorMessage;

      if (errorMessage.includes("API key")) {
        userFriendlyMessage =
          'Authentication error. Please check that your GOOGLE_API_KEY is configured correctly in your environment variables (e.g., in your Vercel project settings for deployment) and that the server has been restarted.';
      }

      toast({
        title: "Image Generation Failed",
        description: userFriendlyMessage,
        variant: "destructive",
      });
      console.error("AI Generation Error:", errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const result = await addProject(values);
    if (result.success) {
      form.reset();
      setGeneratedImageUrl(null);
      toast({
        title: "Project Added!",
        description: "Your new project has been added to the database.",
      });
      await loadProjects();
    } else {
      toast({
        title: "Error",
        description: result.error || "There was a problem saving your project.",
        variant: "destructive",
      });
    }
  };

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

  const featuredCount = projects.filter(p => p.featured).length;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 py-12">
        <section className="container max-w-2xl mx-auto">
          <div className="flex justify-end mb-4">
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
                              Upload your own image or generate one with AI.
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
                                    <p className="mt-2 text-sm">Your uploaded or generated image will appear here.</p>
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
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                className="hidden"
                                accept="image/png, image/jpeg, image/webp"
                            />
                        </CardContent>
                        <CardFooter>
                            <div className="grid w-full grid-cols-2 gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isGenerating || form.formState.isSubmitting}
                                >
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Image
                                </Button>
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
                                            Generate with AI
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardFooter>
                      </Card>

                      <FormField
                        control={form.control}
                        name="featured"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel>Feature on Homepage</FormLabel>
                                    <FormDescription>
                                      {featuredCount >= 3 && !field.value
                                        ? "You can only feature 3 projects."
                                        : "This project will appear first on the home page."
                                      }
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                      disabled={featuredCount >= 3 && !field.value}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                        />
                      
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


          <section className="mt-16">
            <h3 className="text-2xl font-bold tracking-tighter mb-6 font-headline">
              Manage Creations
            </h3>
            <div className="space-y-4">
              {isLoadingProjects ? (
                <div className="text-center text-muted-foreground py-8">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin mb-2" />
                  <p>Loading projects...</p>
                </div>
              ) : projects.length > 0 ? (
                projects.map((project) => (
                  <Card key={project.id} className="bg-secondary/50">
                    <CardContent className="p-4 flex items-center gap-4">
                      <Image
                        src={project.imageUrl || 'https://placehold.co/600x400.png'}
                        alt={project.title}
                        width={80}
                        height={80}
                        className="rounded-md aspect-[3/2] object-cover"
                      />
                      <div className="flex-grow overflow-hidden">
                        <p className="font-semibold truncate">{project.title}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {project.url}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleToggleFeatured(project.id, project.featured || false)}
                        >
                            <Star className={cn("h-4 w-4", project.featured && "text-primary fill-current")} />
                        </Button>
                        <Button asChild variant="outline" size="icon">
                          <Link href={`/admin/edit/${project.id}`}>
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
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete your project.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(project.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No projects have been added yet.
                </p>
              )}
            </div>
          </section>
        </section>
      </main>
      <Footer />
    </div>
  );
}
