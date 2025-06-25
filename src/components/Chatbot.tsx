"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Send, Loader2, Terminal, Volume2, VolumeX } from "lucide-react";
import { askChatbot, type ChatbotOutput } from "@/ai/flows/chatbot-flow";
import { getErrorMessage } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Authentication successful. Welcome, operator. I am the AI assistant for Rahul Halder. How can I help you?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Scroll to the bottom when messages change
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleAudioPlayback = (audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch(e => {
        console.error("Audio playback failed:", e);
        toast({
          title: "Audio Error",
          description: "Could not play audio.",
          variant: "destructive",
        });
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const result: ChatbotOutput = await askChatbot({ question: input });
      if (result?.answer) {
        const assistantMessage: Message = { role: "assistant", content: result.answer };
        setMessages((prev) => [...prev, assistantMessage]);

        if (isAudioEnabled && result.audioUrl) {
          handleAudioPlayback(result.audioUrl);
        }

      } else {
        throw new Error("Received an incomplete response from the AI.");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
       const errorMessage: Message = { role: "assistant", content: "Connection error: Unable to access secure channel. Please try again." };
       setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <audio ref={audioRef} className="hidden" />
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <motion.div
            initial={{ scale: 0, y: 100 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 1 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              size="icon"
              className="rounded-full w-14 h-14 shadow-lg bg-accent hover:bg-accent/90 text-black"
            >
              <Terminal className="h-7 w-7" />
              <span className="sr-only">Open Chatbot</span>
            </Button>
          </motion.div>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="end"
          className="w-[400px] h-[550px] flex flex-col p-0 mr-4 mb-2 rounded-lg overflow-hidden bg-black border-2 border-accent/30 font-code shadow-lg shadow-accent/20"
          sideOffset={10}
        >
          <header className="p-3 bg-accent/10 border-b border-accent/30 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-accent">{'>'}</span>
              <div>
                <h3 className="font-bold text-lg text-foreground">AI Assistant</h3>
                <p className="text-sm text-accent/80">session --user "operator"</p>
              </div>
            </div>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                className="text-accent hover:bg-accent/20 hover:text-accent h-8 w-8"
                aria-label={isAudioEnabled ? "Disable voice" : "Enable voice"}
            >
                {isAudioEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>
          </header>
          
          <ScrollArea className="flex-1" ref={scrollAreaRef}>
            <div className="p-4 space-y-4">
              <AnimatePresence initial={false}>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-sm"
                  >
                    {message.role === 'assistant' ? (
                        <div className="flex gap-2">
                            <span className="text-accent font-bold">[AI]:</span>
                            <p className="flex-1 whitespace-pre-wrap text-foreground/90">{message.content}</p>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <span className="text-primary font-bold">[USER]:</span>
                            <p className="flex-1 whitespace-pre-wrap text-foreground/90">{message.content}</p>
                        </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-2 items-center text-sm"
                  >
                    <span className="text-accent font-bold">[AI]:</span>
                    <span className="h-4 w-2 bg-accent animate-blink" />
                  </motion.div>
              )}
            </div>
          </ScrollArea>
          
          <div className="p-3 border-t border-accent/30 bg-black/50">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <span className="text-primary font-bold">{'>'}</span>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your command..."
                className="flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto text-sm font-code"
                disabled={isLoading}
                autoComplete="off"
              />
              <Button type="submit" size="icon" variant="ghost" className="h-7 w-7 text-accent hover:bg-accent/20 hover:text-accent" disabled={isLoading || !input.trim()}>
                {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
                <span className="sr-only">Send message</span>
              </Button>
            </form>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
