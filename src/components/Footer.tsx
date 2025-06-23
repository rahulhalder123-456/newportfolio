import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background font-code">
      <div className="container py-12">
        <div className="flex flex-col items-center gap-8 text-center">
          
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-primary font-bold">&gt;</span>
            <span className="font-bold text-xl text-foreground">Code Cipher</span>
          </Link>
          
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex items-center gap-2">
                <span className="text-muted-foreground">[navigation]</span>
                <nav className="flex items-center gap-4">
                    <Link href="/#about" className="text-sm text-muted-foreground hover:text-primary transition-colors">./about</Link>
                    <Link href="/projects" className="text-sm text-muted-foreground hover:text-primary transition-colors">./projects</Link>
                    <Link href="/#contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">./contact</Link>
                </nav>
            </div>
            <div className="hidden md:block text-muted-foreground">|</div>
            <div className="flex items-center gap-2">
                <span className="text-muted-foreground">[socials]</span>
                <nav className="flex items-center gap-4">
                    <a href="#" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">open github</a>
                    <a href="#" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">open linkedin</a>
                    <a href="#" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">open twitter</a>
                </nav>
            </div>
          </div>
          
          <div className="flex items-center justify-center text-xs text-muted-foreground">
            <span>&copy; {currentYear} Code Cipher. All Rights Reserved.</span>
            <span className="ml-2 w-2 h-3 bg-primary animate-blink" />
          </div>
        </div>
      </div>
    </footer>
  );
}
