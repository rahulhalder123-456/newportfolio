'use client';

import { useState, useEffect } from 'react';

export default function Footer() {
  const [text, setText] = useState('');
  const [key, setKey] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [fullFooterText, setFullFooterText] = useState('');

  useEffect(() => {
    const year = new Date().getFullYear();
    setFullFooterText(`> Code Cipher

[navigation] ./about ./projects ./contact | [socials] open github open linkedin open twitter

© ${year} Code Cipher. All Rights Reserved.`);
  }, []);

  useEffect(() => {
    if (!fullFooterText) return;

    let typingInterval: NodeJS.Timeout;
    let repeatTimeout: NodeJS.Timeout;

    setText('');
    setIsComplete(false);

    let i = 0;
    typingInterval = setInterval(() => {
      if (i < fullFooterText.length) {
        setText(fullFooterText.substring(0, i + 1));
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
    <footer className="border-t font-code overflow-hidden min-h-[120px] flex items-center">
      <div className="container py-6">
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
