import { CodeXml } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-secondary">
      <div className="container flex items-center justify-center py-6">
        <div className="flex items-center space-x-2">
          <CodeXml className="h-5 w-5 text-primary" />
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} Code Cipher. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
