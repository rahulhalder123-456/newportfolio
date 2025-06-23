import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Github, ArrowRight } from 'lucide-react';

type ProjectCardProps = {
  title: string;
  summary: string;
  url: string;
};

export default function ProjectCard({ title, summary, url }: ProjectCardProps) {
  return (
    <Card className="flex flex-col h-full bg-secondary border-2 border-transparent transition-all duration-300 hover:border-primary hover:shadow-primary/20 hover:shadow-lg hover:-translate-y-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Github className="w-5 h-5 text-primary" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground text-sm">{summary}</p>
      </CardContent>
      <CardFooter>
        <Button asChild variant="link" className="p-0 h-auto text-accent hover:text-primary">
          <a href={url} target="_blank" rel="noopener noreferrer">
            View on GitHub <ArrowRight className="w-4 h-4 ml-2" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
