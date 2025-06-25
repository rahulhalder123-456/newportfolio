
'use client';

import { motion } from 'framer-motion';
import { Bot, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ChatbotTogglerProps = {
  isChatbotOpen: boolean;
  setIsChatbotOpen: (isOpen: boolean) => void;
};

export default function ChatbotToggler({ isChatbotOpen, setIsChatbotOpen }: ChatbotTogglerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-[60]">
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 1.5,
            }}
        >
            <Button
                size="icon"
                onClick={() => setIsChatbotOpen(!isChatbotOpen)}
                className="rounded-full h-14 w-14 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30"
                aria-label={isChatbotOpen ? 'Close Chatbot' : 'Open Chatbot'}
            >
                <motion.div
                    key={isChatbotOpen ? 'close' : 'open'}
                    initial={{ rotate: -90, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    exit={{ rotate: 90, scale: 0 }}
                    transition={{ duration: 0.2 }}
                >
                {isChatbotOpen ? <X className="h-7 w-7" /> : <Bot className="h-7 w-7" />}
                </motion.div>
            </Button>
        </motion.div>
    </div>
  );
}
