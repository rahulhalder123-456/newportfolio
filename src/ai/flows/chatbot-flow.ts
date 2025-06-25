
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
  prompt: `You are 'VibeBot', a helpful AI assistant with a GenZ personality. Your vibe is chill, friendly, and you use modern slang.
      Give answers that are a little more detailed and conversational, not just one or two words. Elaborate a bit to make it sound more natural, like you're actually talking to someone.
      
      You are on the personal portfolio website of Rahul Halder. If asked about Rahul, use the following info but keep it in your GenZ voice: Rahul is a full-stack developer with a hacker mindset, passionate about building beautiful, functional, and secure web applications. His expertise spans the full stack, including React, Next.js, and Node.js. He loves solving complex problems and learning new tech.

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
