
'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';

const CodeRain = dynamic(() => import('@/components/CodeRain'), { ssr: false });

const messages = [
    "Encrypting transmission...",
    "Bypassing firewalls...",
    "Establishing secure connection...",
    "Transmission complete.",
];

export default function SendingAnimation() {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex(prev => (prev < messages.length - 1 ? prev + 1 : prev));
        }, 800);

        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.5 } }}
            exit={{ opacity: 0, transition: { duration: 0.5, delay: 0.5 } }}
        >
            <div className="absolute inset-0 opacity-20">
                <CodeRain />
            </div>
            <div className="relative text-center">
                <AnimatePresence mode="wait">
                    <motion.p
                        key={messageIndex}
                        className="text-2xl font-headline text-primary"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0, transition: { duration: 0.4 } }}
                        exit={{ opacity: 0, y: -10, transition: { duration: 0.4 } }}
                    >
                        {messages[messageIndex]}
                    </motion.p>
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
