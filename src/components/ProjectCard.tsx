import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

type ProjectCardProps = {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
};

export default function ProjectCard({ id, title, summary, imageUrl }: ProjectCardProps) {
  return (
    <Card className="flex flex-col h-full bg-secondary border-2 border-transparent transition-all duration-300 hover:border-primary hover:shadow-primary/20 hover:shadow-lg hover:-translate-y-1 overflow-hidden group">
      <div className="aspect-[3/2] w-full overflow-hidden relative bg-black/20">
          <Image
            src={imageUrl || "https://placehold.co/600x400.png"}
            alt={`Image for ${title}`}
            data-ai-hint="abstract software"
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
      </div>
      <CardHeader>
        <CardTitle className="font-headline">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground text-sm line-clamp-4">{summary}</p>
      </CardContent>
      <CardFooter>
        <Button asChild variant="link" className="p-0 h-auto text-accent hover:text-primary">
          <Link href={`/projects/${encodeURIComponent(id)}`}>
            View Details <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
