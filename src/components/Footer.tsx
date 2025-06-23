'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';

const Footer3DArt = dynamic(() => import('@/components/Footer3DArt'), { 
    ssr: false,
});

export default function Footer() {
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  
  // The full text content to be animated
  const fullFooterText = useMemo(() => 
`> Code Cipher

[navigation] ./about ./projects ./contact | [socials] open github open linkedin open twitter

© ${currentYear} Code Cipher. All Rights Reserved.`
  , [currentYear]);

  const [text, setText] = useState('');
  const [key, setKey] = useState(0); // A key to restart the animation cycle

  useEffect(() => {
    let typingInterval: NodeJS.Timeout;
    let repeatTimeout: NodeJS.Timeout;
    
    // Reset text for the new animation cycle
    setText('');

    let i = 0;
    // Start the typing animation
    typingInterval = setInterval(() => {
      if (i < fullFooterText.length) {
        setText(prev => prev + fullFooterText.charAt(i));
        i++;
      } else {
        clearInterval(typingInterval);
        // Once typing is complete, wait 2 minutes then repeat
        repeatTimeout = setTimeout(() => {
          setKey(prevKey => prevKey + 1);
        }, 120000); // 2 minutes in milliseconds
      }
    }, 50); // Typing speed in milliseconds

    // Cleanup function to clear timers when the component unmounts or the key changes
    return () => {
      clearInterval(typingInterval);
      clearTimeout(repeatTimeout);
    };
  }, [key, fullFooterText]);

  return (
    <footer className="relative border-t font-code overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-15">
            <Footer3DArt />
        </div>
      <div className="container py-8">
        <div className="relative z-10 flex flex-col items-center gap-8 text-center">
            {/* Using <pre> to preserve whitespace and newlines, and a min-height to prevent layout shift */}
            <div className="text-left text-sm text-muted-foreground min-h-[100px]">
              <pre className="whitespace-pre-wrap">
                {text}
                {/* The blinking cursor */}
                <span className="ml-1 w-2 h-3 bg-primary animate-blink inline-block" />
              </pre>
            </div>
        </div>
      </div>
    </footer>
  );
}
