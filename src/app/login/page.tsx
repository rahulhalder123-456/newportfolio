
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { KeyRound } from "lucide-react";
import { useEffect } from "react";

const formSchema = z.object({
  password: z.string().min(1, "Password is required."),
});

// The password is now stored in an environment variable for better security.
// In a real application, this should be handled by a proper auth system.
const CORRECT_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // If user is already authenticated, redirect them to admin page
    const isAuthenticated = sessionStorage.getItem("isAuthenticated");
    if (isAuthenticated === "true") {
      router.replace("/admin");
    }
  }, [router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.password === CORRECT_PASSWORD) {
      sessionStorage.setItem("isAuthenticated", "true");
      router.replace("/admin");
    } else {
      toast({
        title: "Incorrect Password",
        description: "The password you entered is incorrect. Please try again.",
        variant: "destructive",
      });
      form.reset();
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <section className="w-full">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-sm">
              <Card>
                  <CardHeader className="text-center">
                      <CardTitle>Admin Access</CardTitle>
                      <CardDescription>Enter the password to manage projects.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Password</FormLabel>
                                  <div className="relative">
                                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                      <FormControl>
                                          <Input type="password" placeholder="••••••••" {...field} className="pl-10" />
                                      </FormControl>
                                  </div>
                                  <FormMessage />
                              </FormItem>
                          )}
                          />
                          <Button type="submit" className="w-full">
                              Unlock
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
