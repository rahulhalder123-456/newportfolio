import Link from 'next/link';
import { CodeXml, Github, Linkedin, Twitter } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-secondary">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          {/* Column 1: Brand Info */}
          <div className="flex flex-col items-center md:items-start">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <CodeXml className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg font-headline">Code Cipher</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs">
              Hacker, Full-Stack Developer & AI Enthusiast. Crafting secure, scalable, and intelligent web solutions.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="md:mx-auto">
            <h3 className="font-semibold text-foreground mb-4 font-headline">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/#about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About</Link>
              </li>
              <li>
                <Link href="/projects" className="text-sm text-muted-foreground hover:text-primary transition-colors">Projects</Link>
              </li>
              <li>
                <Link href="/#contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Socials */}
          <div className="md:ml-auto flex flex-col items-center md:items-end">
             <h3 className="font-semibold text-foreground mb-4 font-headline">Connect With Me</h3>
             <div className="flex items-center space-x-4">
                <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Github Profile" className="text-muted-foreground hover:text-primary transition-colors">
                  <Github className="h-6 w-6" />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile" className="text-muted-foreground hover:text-primary transition-colors">
                  <Linkedin className="h-6 w-6" />
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Twitter Profile" className="text-muted-foreground hover:text-primary transition-colors">
                  <Twitter className="h-6 w-6" />
                </a>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-border/40" />
        
        <div className="text-center text-sm text-muted-foreground">
          &copy; {currentYear} Code Cipher. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
