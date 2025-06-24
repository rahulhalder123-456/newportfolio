import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Github, ArrowRight } from 'lucide-react';

type ProjectCardProps = {
  title: string;
  summary: string;
  url: string;
  imageUrl: string;
};

export default function ProjectCard({ title, summary, url, imageUrl }: ProjectCardProps) {
  return (
    <Card className="flex flex-col h-full bg-secondary border-2 border-transparent transition-all duration-300 hover:border-primary hover:shadow-primary/20 hover:shadow-lg hover:-translate-y-1 overflow-hidden group">
      <div className="aspect-video w-full overflow-hidden relative">
          <Image
            src={imageUrl || "https://placehold.co/600x400.png"}
            alt={`Image for ${title}`}
            data-ai-hint="abstract software"
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
      </div>
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
