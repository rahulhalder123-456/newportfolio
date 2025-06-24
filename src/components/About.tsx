
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
              <svg className="absolute w-0 h-0">
                <defs>
                  <clipPath id="blob" clipPathUnits="userSpaceOnUse">
                    <path d="M403,283.5Q394,367,319.5,404.5Q245,442,175,402.5Q105,363,78,294Q51,225,103.5,163.5Q156,102,240.5,84.5Q325,67,362.5,157.5Q400,248,403,283.5Z" />
                  </clipPath>
                </defs>
              </svg>
              <div
                className="w-full h-full"
                style={{ clipPath: "url(#blob)" }}
              >
                <Image
                  src="/mine.png"
                  alt="Rahul Halder"
                  width={400}
                  height={400}
                  className="object-cover w-full h-full"
                />
              </div>
              <svg
                viewBox="0 0 450 450"
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
              >
                <path
                  d="M403,283.5Q394,367,319.5,404.5Q245,442,175,402.5Q105,363,78,294Q51,225,103.5,163.5Q156,102,240.5,84.5Q325,67,362.5,157.5Q400,248,403,283.5Z"
                  stroke="hsl(var(--primary))"
                  strokeWidth="6"
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
