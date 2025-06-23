import { CodeXml, Github, Linkedin, Twitter } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center space-x-2 mr-auto">
          <CodeXml className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg font-headline">Code Cipher</span>
        </div>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <a href="#projects" className="text-muted-foreground transition-colors hover:text-primary">Projects</a>
            <a href="#about" className="text-muted-foreground transition-colors hover:text-primary">About</a>
            <a href="#contact" className="text-muted-foreground transition-colors hover:text-primary">Contact</a>
        </nav>
        <div className="flex items-center space-x-4 ml-6">
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
    </header>
  );
}
