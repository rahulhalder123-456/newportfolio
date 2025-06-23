import Image from "next/image";
import dynamic from "next/dynamic";

const AtomicModel = dynamic(() => import('@/components/AtomicModel'), { 
    ssr: false,
    loading: () => <div className="w-full h-full" />
});

export default function About() {
  return (
    <section id="about" className="relative w-full py-12 md:py-24 lg:py-32 bg-secondary overflow-hidden">
      <div className="absolute inset-0 opacity-10 lg:opacity-15 pointer-events-none">
        <AtomicModel />
      </div>
      <div className="container relative z-10">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="flex justify-center order-first md:order-last">
            <Image
              src="https://placehold.co/400x400.png"
              alt="Jane Doe"
              width={400}
              height={400}
              className="rounded-full object-cover border-4 border-primary/50 shadow-lg"
              data-ai-hint="profile picture"
            />
          </div>
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-4 text-center md:text-left">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">About Me</h2>
              <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                I'm a full-stack developer with a hacker mindset, passionate about building beautiful, functional, and secure web applications. My expertise spans across the stack, from crafting intuitive front-end experiences with React and Next.js to architecting robust back-end systems with Node.js. I thrive on solving complex problems, exploring system intricacies, and continuously learning new technologies to push the boundaries of what's possible.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <div className="bg-primary/20 text-primary text-sm font-medium px-3 py-1 rounded-full">React</div>
              <div className="bg-primary/20 text-primary text-sm font-medium px-3 py-1 rounded-full">Next.js</div>
              <div className="bg-primary/20 text-primary text-sm font-medium px-3 py-1 rounded-full">Node.js</div>
              <div className="bg-primary/20 text-primary text-sm font-medium px-3 py-1 rounded-full">TypeScript</div>
              <div className="bg-primary/20 text-primary text-sm font-medium px-3 py-1 rounded-full">Cybersecurity</div>
              <div className="bg-primary/20 text-primary text-sm font-medium px-3 py-1 rounded-full">AI/ML</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
