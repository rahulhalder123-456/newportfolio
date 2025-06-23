'use client';

import { useState, useEffect, useMemo } from 'react';

export default function Footer() {
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  const fullFooterText = useMemo(
    () => `> Code Cipher

[navigation] ./about ./projects ./contact | [socials] open github open linkedin open twitter

© ${currentYear} Code Cipher. All Rights Reserved.`,
    [currentYear]
  );

  const [text, setText] = useState('');
  const [key, setKey] = useState(0); // Used to reset typing animation
  const [isComplete, setIsComplete] = useState(false); // Determines if typing is finished

  useEffect(() => {
    let typingInterval: NodeJS.Timeout;
    let repeatTimeout: NodeJS.Timeout;

    setText('');
    setIsComplete(false);

    let i = 0;
    typingInterval = setInterval(() => {
      if (i < fullFooterText.length) {
        setText((prev) => prev + fullFooterText.charAt(i));
        i++;
      } else {
        clearInterval(typingInterval);
        setIsComplete(true);
        repeatTimeout = setTimeout(() => {
          setKey((prevKey) => prevKey + 1);
        }, 120000); // 2 minutes
      }
    }, 50);

    return () => {
      clearInterval(typingInterval);
      clearTimeout(repeatTimeout);
    };
  }, [key, fullFooterText]);

  const handleRestart = () => {
    setKey((prev) => prev + 1);
  };

  return (
    <footer className="border-t font-code overflow-hidden">
      <div className="container py-8">
        <div className="flex flex-col items-center gap-8 text-center">
          <div className="text-left text-sm text-muted-foreground min-h-[80px]">
            <pre className="whitespace-pre-wrap cursor-pointer" onClick={handleRestart}>
              {text}
              {isComplete && (
                <span
                  aria-hidden="true"
                  className="ml-1 w-2 h-3 bg-primary animate-blink inline-block"
                />
              )}
            </pre>
          </div>
        </div>
      </div>
    </footer>
  );
}
