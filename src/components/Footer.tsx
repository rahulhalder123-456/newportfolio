import Link from 'next/link';
import { CodeXml } from 'lucide-react';
import FooterArt from './FooterArt';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t bg-secondary/50 font-code overflow-hidden">
      <FooterArt />
      <div className="container relative z-10 py-16 text-center">
        <div className="flex flex-col items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-primary font-bold">&gt;</span>
            <CodeXml className="h-6 w-6 text-accent" />
            <span className="font-bold text-xl text-foreground">Code Cipher</span>
          </Link>
          
          <nav className="flex justify-center gap-6 md:gap-8">
            <Link href="/#about" className="text-sm text-muted-foreground hover:text-primary transition-colors">./about</Link>
            <Link href="/projects" className="text-sm text-muted-foreground hover:text-primary transition-colors">./projects</Link>
            <Link href="/#contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">./contact</Link>
          </nav>
          
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            <span>&copy; {currentYear} Code Cipher. All Rights Reserved.</span>
            <span className="ml-2 w-2 h-4 bg-primary animate-blink" />
          </div>
        </div>
      </div>
    </footer>
  );
}
