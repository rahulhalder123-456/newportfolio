
'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import HyperloopAnimation from './HyperloopAnimation';

type AnimatedTransitionProps = {
  children: [React.ReactNode, React.ReactNode];
};

export default function AnimatedTransition({ children }: AnimatedTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const [before, after] = children;

  const beforeOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const beforeScale = useTransform(scrollYProgress, [0, 0.35], [1, 0.8]);

  const hyperloopOpacity = useTransform(
    scrollYProgress,
    [0.3, 0.5, 0.7],
    [0, 1, 0]
  );
  
  const afterOpacity = useTransform(scrollYProgress, [0.65, 1], [0, 1]);
  const afterScale = useTransform(scrollYProgress, [0.65, 1], [0.8, 1]);

  return (
    <div ref={containerRef} className="relative h-[250vh] md:h-[300vh] w-full">
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
        <motion.div
          style={{ opacity: hyperloopOpacity }}
          className="absolute inset-0 z-10"
        >
          <HyperloopAnimation />
        </motion.div>
        
        <motion.div
          style={{ opacity: beforeOpacity, scale: beforeScale }}
          className="absolute inset-0 z-20"
        >
          {before}
        </motion.div>

        <motion.div
          style={{ opacity: afterOpacity, scale: afterScale }}
          className="absolute inset-0 z-20 overflow-y-auto no-scrollbar"
        >
          {after}
        </motion.div>
      </div>
    </div>
  );
}
