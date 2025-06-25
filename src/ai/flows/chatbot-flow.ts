'use server';
/**
 * @fileOverview A rule-based chatbot that provides text responses.
 *
 * - chatWithVibeBot - A function that handles the chat interaction.
 */
import {
  type ChatbotInput,
  type ChatbotOutput,
} from './chatbot.schema';

// Helper function to get a random item from an array
const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

// Pre-defined responses with a "GenZ hacker" vibe
const responses = {
  greetings: [
    "Ayo, what's good?",
    "Sup.",
    "Wassup, how can I help?",
    "Yo.",
  ],
  about: [
    "Rahul's a full-stack dev with a hacker mindset, passionate about building beautiful, functional, and secure web apps. He's skilled in React, Next.js, and Node.js. Basically, a low-key tech genius.",
    "Oh, Rahul? Total coding wizard. He builds sick websites and is all about that cybersecurity life. Seriously talented.",
  ],
  projects: [
    "He's always cooking up something new. His latest projects are usually on his projects page or GitHub. He's big on AI and full-stack apps.",
    "His projects? They're fire. He does a lot with web dev and AI. You should def check out the projects section for the latest.",
  ],
  farewell: [
    "Aight, catch you later.",
    "Peace out.",
    "Later!",
  ],
  default: [
    "Bet. What else is up?",
    "Word. Anything else?",
    "I'm here if you need anything else.",
    "Gotcha. Ask me something else if you want.",
  ],
};

// The main function that gets called from the frontend
export async function chatWithVibeBot(
  input: ChatbotInput
): Promise<ChatbotOutput> {
  const query = input.query.toLowerCase();
  let answer = '';

  if (/\b(hello|hi|hey|sup|wassup)\b/.test(query)) {
    answer = getRandom(responses.greetings);
  } else if (/\b(rahul|he|him|his)\b/.test(query) && !/\b(project|work)\b/.test(query)) {
    answer = getRandom(responses.about);
  } else if (/\b(project|work|latest|recent)\b/.test(query)) {
    answer = getRandom(responses.projects);
  } else if (/\b(bye|see ya|later)\b/.test(query)) {
    answer = getRandom(responses.farewell);
  } else {
    answer = getRandom(responses.default);
  }
  
  // Artificial delay to simulate "thinking"
  await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));

  return { answer };
}
