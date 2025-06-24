
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

const loadingSteps = [
    "Initializing sequence...",
    "Decrypting data streams...",
    "Activating neural interface...",
    "Welcome, operator.",
];

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    // Animate the loading text
    const textInterval = setInterval(() => {
        setLoadingStep(prev => {
            if (prev < loadingSteps.length - 1) {
                return prev + 1;
            }
            clearInterval(textInterval);
            return prev;
        });
    }, 800);

    // Wait for the page to be fully loaded and a minimum delay
    const pageLoadPromise = new Promise(resolve => {
        if (document.readyState === 'complete') {
            resolve(true);
        } else {
            window.addEventListener('load', () => resolve(true), { once: true });
        }
    });

    const minDisplayTime = new Promise(resolve => setTimeout(resolve, loadingSteps.length * 800 + 200));

    Promise.all([pageLoadPromise, minDisplayTime]).then(() => {
        setIsLoading(false);
    });

    return () => clearInterval(textInterval);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="loader"
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8, delay: 0.2 } }}
          >
            <LoadingSpinner />
            <AnimatePresence mode="wait">
                <motion.p
                    key={loadingStep}
                    className="text-lg text-muted-foreground"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.4 } }}
                    exit={{ opacity: 0, y: -10, transition: { duration: 0.4 } }}
                >
                    {loadingSteps[loadingStep]}
                </motion.p>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="flex flex-col min-h-[100dvh] bg-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.8 }}
      >
        <Header />
        <main className="flex-1 relative overflow-x-clip">
          <BackgroundArt />
          <Hero />
          <SectionDivider />
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
      </motion.div>
    </>
  );
}
