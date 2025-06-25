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
import LoadingSpinner from '@/components/LoadingSpinner';
import ChatbotToggler from '@/components/ChatbotToggler';
import AiChatbot from '@/components/AiChatbot';
import type { Project } from "@/app/projects/actions";
import HyperloopDivider from './HyperloopDivider';
import AnimatedTransition from './AnimatedTransition';

const BackgroundArt = dynamic(() => import('@/components/BackgroundArt'), { ssr: false });

const loadingSteps = [
    "Initializing sequence...",
    "Decrypting data streams...",
    "Activating neural interface...",
    "Welcome, operator.",
];

type HomeClientProps = {
  projects: Project[];
};

export default function HomeClient({ projects }: HomeClientProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

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
    }, 550);

    // Wait for the page to be fully loaded and a minimum delay
    const pageLoadPromise = new Promise(resolve => {
        if (document.readyState === 'complete') {
            resolve(true);
        } else {
            window.addEventListener('load', () => resolve(true), { once: true });
        }
    });

    const minDisplayTime = new Promise(resolve => setTimeout(resolve, loadingSteps.length * 550 + 200));

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
          <AnimatedTransition>
            <Hero />
            <About />
          </AnimatedTransition>
          <Projects
              projects={projects}
              className="py-12 md:py-24 lg:py-32"
              showViewAllButton={true} 
              title="Featured Creations"
              description="Here are a few of my projects I've selected to highlight. Feel free to explore more of my work on the projects page."
          />
          <HyperloopDivider />
          <Contact />
        </main>
        <Footer />

        <ChatbotToggler 
          isChatbotOpen={isChatbotOpen} 
          setIsChatbotOpen={setIsChatbotOpen} 
        />
        <AnimatePresence>
          {isChatbotOpen && <AiChatbot onClose={() => setIsChatbotOpen(false)} />}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
