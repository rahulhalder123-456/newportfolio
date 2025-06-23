import dynamic from "next/dynamic";

const AtomicModel = dynamic(() => import('@/components/AtomicModel'), { 
    ssr: false,
    loading: () => <div className="w-full h-full rounded-full bg-card" />
});

export default function About() {
  return (
    <section id="about" className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
      <div className="container">
        <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
          <div className="mx-auto aspect-square w-full max-w-[500px] lg:max-w-[600px] overflow-hidden rounded-full">
            <AtomicModel />
          </div>
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">About Me</h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                I'm a full-stack developer with a hacker mindset, passionate about building beautiful, functional, and secure web applications. My expertise spans across the stack, from crafting intuitive front-end experiences with React and Next.js to architecting robust back-end systems with Node.js. I thrive on solving complex problems, exploring system intricacies, and continuously learning new technologies to push the boundaries of what's possible.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
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
