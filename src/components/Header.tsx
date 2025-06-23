'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { CodeXml } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  const projectsHref = '/projects';
  const aboutHref = isHomePage ? '#about' : '/#about';
  const contactHref = isHomePage ? '#contact' : '/#contact';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center space-x-2 mr-auto">
          <CodeXml className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg font-headline">Code Cipher</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href={aboutHref} className="text-muted-foreground transition-colors hover:text-primary">About</Link>
            <Link href={projectsHref} className="text-muted-foreground transition-colors hover:text-primary">Projects</Link>
            <Link href={contactHref} className="text-muted-foreground transition-colors hover:text-primary">Contact</Link>
        </nav>
      </div>
    </header>
  );
}
