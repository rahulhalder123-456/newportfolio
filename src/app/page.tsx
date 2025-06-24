"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Projects from '@/components/Projects';
import About from '@/components/About';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import dynamic from 'next/dynamic';
import SectionDivider from '@/components/SectionDivider';
import LoadingSpinner from '@/components/LoadingSpinner';

const BackgroundArt = dynamic(() => import('@/components/BackgroundArt'), { ssr: false });

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate a loading delay to ensure the animation is visible
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Adjust time as needed

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="loader"
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LoadingSpinner />
            <p className="text-lg text-muted-foreground">Initializing sequence...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col min-h-[100dvh] bg-background">
        <Header />
        <main className="flex-1 relative overflow-x-clip">
          <BackgroundArt />
          <Hero />
          <About />
          <Projects
              className="py-12 md:py-24 lg:py-32" 
              limit={3} 
              showViewAllButton={true} 
              title="Latest Creations"
              description="Here are a few of my most recent projects. Feel free to explore more of my work on the projects page."
          />
          <SectionDivider />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  );
}