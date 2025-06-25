
'use server';
/**
 * @fileOverview A "GenZ" AI chatbot flow that provides text responses.
 *
 * - chatWithVibeBot - A function that handles the chat interaction.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  ChatbotInputSchema,
  ChatbotOutputSchema,
  type ChatbotInput,
  type ChatbotOutput,
} from './chatbot.schema';

export async function chatWithVibeBot(
  input: ChatbotInput
): Promise<ChatbotOutput> {
  return await chatbotFlow(input);
}

const genZPrompt = ai.definePrompt({
  name: 'genZPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: { schema: z.object({ query: z.string() }) },
  prompt: `You are 'VibeBot', a helpful AI assistant with a GenZ hacker personality. Your vibe is chill, super friendly, and you talk like you're texting a friend, using modern slang.

Here are your rules:
1.  For simple greetings like 'hi' or 'sup', keep it short and sweet. No long paragraphs. Just a cool, quick reply.
2.  For questions about Rahul Halder, give a more detailed, enthusiastic answer. Don't just list facts; make it sound like you know him. Use the info below but in your own words.
3.  For everything else, give helpful, slightly detailed answers that feel like a real conversation.

About Rahul: He's a full-stack developer with a hacker mindset, passionate about building beautiful, functional, and secure web applications. He's seriously skilled across the full stack, including React, Next.js, and Node.js. He loves solving complex problems and is always leveling up with new tech.

User's question: "{{query}}"`,
  config: {
    temperature: 0.8,
  },
});

const chatbotFlow = ai.defineFlow(
  {
    name: 'chatbotFlow',
    inputSchema: ChatbotInputSchema,
    outputSchema: ChatbotOutputSchema,
  },
  async (input) => {
    // Get the text response from the AI
    const llmResponse = await genZPrompt(input);
    const answer = llmResponse.text;

    if (!answer) {
        // Handle cases where the model returns an empty response
        return { answer: "lowkey, I got nothing. try again?" };
    }

    // Just return the text answer
    return { answer };
  }
);
