
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const evolutionImages = [
  { src: 'https://placehold.co/400x400.png', alt: 'Ape', hint: 'ape primate' },
  { src: 'https://placehold.co/400x400.png', alt: 'Caveman', hint: 'caveman prehistoric' },
  { src: '/mine.png', alt: 'Modern Human', hint: 'man portrait' },
  { src: 'https://placehold.co/400x400.png', alt: 'Cyborg', hint: 'cyborg futuristic' },
];

export default function EvolutionImage() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % evolutionImages.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden pointer-events-none">
        <div className="relative w-48 h-48 md:w-56 md:h-56">
            <AnimatePresence>
                <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.7, ease: 'easeInOut' }}
                    className="absolute inset-0"
                >
                    <Image
                        src={evolutionImages[activeIndex].src}
                        alt={evolutionImages[activeIndex].alt}
                        data-ai-hint={evolutionImages[activeIndex].hint}
                        width={224}
                        height={224}
                        className="object-cover rounded-full w-full h-full opacity-30"
                    />
                </motion.div>
            </AnimatePresence>
        </div>
    </div>
  );
}
