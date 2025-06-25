
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { chatWithVibeBot } from '@/ai/flows/chatbot-flow';
import { getErrorMessage } from '@/lib/utils';
import { cn } from '@/lib/utils';

type Message = {
  id: number;
  role: 'user' | 'bot';
  text: string;
};

type AiChatbotProps = {
  onClose: () => void;
};

export default function AiChatbot({ onClose }: AiChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthesisRef.current = window.speechSynthesis;
      const loadVoices = () => {
        setVoices(synthesisRef.current?.getVoices() ?? []);
      };

      // Voices often load asynchronously.
      loadVoices();
      if (synthesisRef.current) {
        synthesisRef.current.onvoiceschanged = loadVoices;
      }
    }

    setMessages([
      { id: 1, role: 'bot', text: "Ayo, what's the tea? Ask me anything." }
    ]);
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);
  
  const speak = (text: string) => {
    const synthesis = synthesisRef.current;
    if (!synthesis || voices.length === 0) return;
    
    synthesis.cancel(); // Stop any previous speech
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Voice selection for a "GenZ hacker" vibe.
    // Prioritizes a standard, often clear Google voice, then a US female voice.
    const preferredVoice = voices.find(voice => voice.name === 'Google US English') ||
                          voices.find(voice => voice.lang === 'en-US' && voice.name.toLowerCase().includes('female')) ||
                          voices.find(voice => voice.lang.startsWith('en-US')) ||
                          voices.find(voice => voice.lang.startsWith('en')) ||
                          voices[0]; // Fallback to the first available English voice
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.rate = 1.1; // A bit faster for a more energetic feel
    utterance.pitch = 1; // Slightly higher pitch

    synthesis.speak(utterance);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now(), role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const result = await chatWithVibeBot({ query: currentInput });
      const botMessage: Message = { id: Date.now() + 1, role: 'bot', text: result.answer };
      setMessages((prev) => [...prev, botMessage]);
      speak(result.answer);

    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error(`Chatbot failed: ${errorMessage}`);
      
      let botText = 'Oof, major L. My circuits are fried right now. Maybe try again later.';
      if (errorMessage.includes('API key not valid')) {
        botText = 'Yikes, my API key is invalid. The admin needs to check the .env file.';
      } else if (errorMessage.toLowerCase().includes('quota')) {
        botText = "Sheesh, I'm too popular. We've hit the usage limit for today. Try again tomorrow!";
      }

      const botMessage: Message = {
        id: Date.now() + 1,
        role: 'bot',
        text: botText,
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed bottom-20 right-4 w-[90vw] max-w-sm h-[70vh] max-h-[600px] z-50"
    >
      <div className="flex flex-col h-full rounded-lg border border-primary/20 bg-background/80 backdrop-blur-md shadow-2xl shadow-primary/20 font-code">
        <header className="flex items-center justify-between p-3 border-b border-primary/20">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary animate-pulse" />
            <h3 className="font-bold text-lg text-primary">VibeBot</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={() => {
            if (synthesisRef.current) synthesisRef.current.cancel();
            onClose();
          }}>
            <X className="h-5 w-5" />
          </Button>
        </header>

        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex w-full items-start gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'bot' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg px-4 py-2 text-sm break-words',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary'
                  )}
                >
                  <p>{message.text}</p>
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div className="bg-secondary rounded-lg px-4 py-2">
                     <Loader2 className="w-5 h-5 animate-spin"/>
                  </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <footer className="p-3 border-t border-primary/20">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="spill the tea..."
              className="flex-1 bg-background/50 focus:ring-accent"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </form>
        </footer>
      </div>
    </motion.div>
  );
}
