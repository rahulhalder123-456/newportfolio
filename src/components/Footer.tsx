import Link from 'next/link';
import { CodeXml, Github, Linkedin, Twitter } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-secondary/50 font-code">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center md:text-left">
          <div className="flex justify-center md:justify-start">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-primary font-bold">&gt;</span>
              <CodeXml className="h-5 w-5 text-accent" />
              <span className="font-bold text-lg text-foreground">Code Cipher</span>
            </Link>
          </div>

          <nav className="flex justify-center gap-6 md:gap-8">
            <Link href="/#about" className="text-sm text-muted-foreground hover:text-primary transition-colors">./about</Link>
            <Link href="/projects" className="text-sm text-muted-foreground hover:text-primary transition-colors">./projects</Link>
            <Link href="/#contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">./contact</Link>
          </nav>

          <div className="flex justify-center md:justify-end items-center space-x-4">
             <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Github Profile" className="text-muted-foreground hover:text-primary transition-colors">
               <Github className="h-5 w-5" />
             </a>
             <a href="#" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile" className="text-muted-foreground hover:text-primary transition-colors">
               <Linkedin className="h-5 w-5" />
             </a>
             <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Twitter Profile" className="text-muted-foreground hover:text-primary transition-colors">
               <Twitter className="h-5 w-5" />
             </a>
         </div>
        </div>

        <Separator className="my-6 bg-border/40" />
        
        <div className="flex items-center justify-center text-sm text-muted-foreground">
          <span>&copy; {currentYear} Code Cipher. All Rights Reserved.</span>
          <span className="ml-2 w-2 h-4 bg-primary animate-blink" />
        </div>
      </div>
    </footer>
  );
}
