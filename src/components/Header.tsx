
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { CodeXml, Github, Linkedin, Briefcase, Menu } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

export default function Header() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  const projectsHref = '/projects';
  const aboutHref = isHomePage ? '#about' : '/#about';
  const contactHref = isHomePage ? '#contact' : '/#contact';

  const navLinks = [
    { href: aboutHref, label: 'About' },
    { href: projectsHref, label: 'Projects' },
    { href: contactHref, label: 'Contact' },
  ];

  const socialLinks = [
    { href: 'https://github.com/rahulhalder123-456', label: 'Github', icon: Github },
    { href: 'https://www.linkedin.com/in/rahul-halder-755756264/', label: 'LinkedIn', icon: Linkedin },
    { href: 'https://talentflow-app.vercel.app/', label: 'TalentFlow', icon: Briefcase },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center space-x-2 mr-auto">
          <CodeXml className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg font-headline">Rahul Halder</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navLinks.map(link => (
            <Link key={link.label} href={link.href} className="text-muted-foreground transition-colors hover:text-primary">{link.label}</Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center ml-6 space-x-4">
          <Separator orientation="vertical" className="h-6"/>
          {socialLinks.map(link => (
            <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={`${link.label} Profile`} className="text-muted-foreground hover:text-primary transition-colors">
              <link.icon className="h-5 w-5" />
            </a>
          ))}
        </div>
        
        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation Menu</SheetTitle>
                <SheetDescription>
                  Links to different sections of the portfolio and social media profiles.
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col h-full">
                <div className="p-6">
                    <SheetClose asChild>
                        <Link href="/" className="flex items-center space-x-2">
                            <CodeXml className="h-6 w-6 text-primary" />
                            <span className="font-bold text-lg font-headline">Rahul Halder</span>
                        </Link>
                    </SheetClose>
                </div>
                <Separator />
                <nav className="flex flex-col p-6 space-y-4">
                  {navLinks.map(link => (
                    <SheetClose asChild key={link.label}>
                      <Link href={link.href} className="text-lg font-medium text-foreground transition-colors hover:text-primary">{link.label}</Link>
                    </SheetClose>
                  ))}
                </nav>
                <div className="mt-auto p-6">
                  <Separator className="my-4" />
                  <div className="flex items-center justify-center space-x-6">
                    {socialLinks.map(link => (
                      <SheetClose asChild key={link.label}>
                        <a href={link.href} target="_blank" rel="noopener noreferrer" aria-label={`${link.label} Profile`} className="text-muted-foreground hover:text-primary transition-colors">
                          <link.icon className="h-6 w-6" />
                        </a>
                      </SheetClose>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </header>
  );
}
