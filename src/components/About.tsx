
"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const AtomicModel = dynamic(() => import('@/components/AtomicModel'), { 
    ssr: false,
    loading: () => <div className="w-full h-full" />
});

export default function About() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  const skillVariants = {
    hidden: { scale: 0.5, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
    }
  };


  return (
    <section id="about" className="relative w-full py-12 md:py-24 lg:py-32 bg-secondary overflow-hidden h-full flex items-center">
      <div className="absolute inset-0 opacity-10 lg:opacity-15 pointer-events-none">
        <AtomicModel />
      </div>
      <div className="container relative z-10">
        <motion.div 
          className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <motion.div 
            className="flex justify-center order-first md:order-last"
            variants={itemVariants}
          >
            <div className="relative w-[300px] h-[300px] sm:w-[350px] sm:h-[350px] md:w-[400px] md:h-[400px]">
              <div
                className="w-full h-full"
                style={{ clipPath: "url(#blob-shape)" }}
              >
                <Image
                  src="https://placehold.co/400x400.png"
                  alt="Rahul Halder"
                  width={400}
                  height={400}
                  className="object-cover w-full h-full"
                  data-ai-hint="person portrait"
                />
              </div>
              <svg
                viewBox="0 0 500 500"
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
              >
                <defs>
                  <clipPath id="blob-shape">
                    <path d="M433.8,293.3c3.8,32.5-30.5,68.8-62,91.2c-31.5,22.3-60.1,30.8-93,28.8c-32.9-2-70-14.6-94.8-38.3c-24.8-23.7-37.3-58.4-33.8-90.2c3.5-31.8,23-60.7,50.8-79.9c27.8-19.2,63.9-28.7,95.5-23.8c31.6,4.8,58.7,24.3,75.8,51.8C420,240.3,430,260.8,433.8,293.3Z" />
                  </clipPath>
                </defs>
                <path
                  d="M433.8,293.3c3.8,32.5-30.5,68.8-62,91.2c-31.5,22.3-60.1,30.8-93,28.8c-32.9-2-70-14.6-94.8-38.3c-24.8-23.7-37.3-58.4-33.8-90.2c3.5-31.8,23-60.7,50.8-79.9c27.8-19.2,63.9-28.7,95.5-23.8c31.6,4.8,58.7,24.3,75.8,51.8C420,240.3,430,260.8,433.8,293.3Z"
                  stroke="hsl(var(--primary))"
                  strokeWidth="8"
                  fill="none"
                />
              </svg>
            </div>
          </motion.div>
          <motion.div 
            className="flex flex-col justify-center space-y-4"
            variants={containerVariants}
          >
            <motion.div 
              className="space-y-4 text-center md:text-left"
              variants={itemVariants}
            >
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">About Me</h2>
              <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                I'm a full-stack developer with a hacker mindset, passionate about building beautiful, functional, and secure web applications. My expertise spans across the stack, from crafting intuitive front-end experiences with React and Next.js to architecting robust back-end systems with Node.js. I thrive on solving complex problems, exploring system intricacies, and continuously learning new technologies to push the boundaries of what's possible.
              </p>
            </motion.div>
            <motion.div 
              className="flex flex-wrap gap-2 justify-center md:justify-start"
              variants={containerVariants}
            >
              <motion.div variants={skillVariants} className="bg-primary/20 text-primary text-sm font-medium px-3 py-1 rounded-full">React</motion.div>
              <motion.div variants={skillVariants} className="bg-primary/20 text-primary text-sm font-medium px-3 py-1 rounded-full">Next.js</motion.div>
              <motion.div variants={skillVariants} className="bg-primary/20 text-primary text-sm font-medium px-3 py-1 rounded-full">Node.js</motion.div>
              <motion.div variants={skillVariants} className="bg-primary/20 text-primary text-sm font-medium px-3 py-1 rounded-full">TypeScript</motion.div>
              <motion.div variants={skillVariants} className="bg-primary/20 text-primary text-sm font-medium px-3 py-1 rounded-full">Cybersecurity</motion.div>
              <motion.div variants={skillVariants} className="bg-primary/20 text-primary text-sm font-medium px-3 py-1 rounded-full">AI/ML</motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
