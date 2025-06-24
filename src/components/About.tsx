
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
          animate="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <motion.div 
            className="flex justify-center order-first md:order-last"
            variants={itemVariants}
          >
            <Image
              src="https://placehold.co/400x400.png"
              alt="Rahul Halder"
              width={400}
              height={400}
              className="rounded-full object-cover border-4 border-primary/50 shadow-lg"
              data-ai-hint="profile picture"
            />
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
