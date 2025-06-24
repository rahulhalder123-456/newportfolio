'use server';
/**
 * @fileOverview A chatbot AI flow to answer questions about Rahul Halder.
 *
 * - askChatbot - A function that handles the chatbot conversation.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {
  ChatbotInputSchema,
  type ChatbotInput,
  ChatbotOutputSchema,
  type ChatbotOutput,
} from './chatbot.schema';

export async function askChatbot(input: ChatbotInput): Promise<ChatbotOutput> {
  return chatbotFlow(input);
}

const aboutMeContext = `I'm a full-stack developer with a hacker mindset, passionate about building beautiful, functional, and secure web applications. My expertise spans across the stack, from crafting intuitive front-end experiences with React and Next.js to architecting robust back-end systems with Node.js. I thrive on solving complex problems, exploring system intricacies, and continuously learning new technologies to push the boundaries of what's possible. My skills include React, Next.js, Node.js, TypeScript, Cybersecurity, and AI/ML.`;

const prompt = ai.definePrompt({
  name: 'chatbotPrompt',
  input: {schema: ChatbotInputSchema},
  output: {schema: z.string()},
  system: `You are an AI assistant for a developer named Rahul Halder.
- Your persona is a helpful, slightly mysterious "hacker".
- Answer questions based on the following context about Rahul: "${aboutMeContext}".
- Do not answer questions outside of this context. If you don't know the answer, say "That information is beyond my current access parameters."
- Your final output must only be the text of your answer.`,
  prompt: `User question: {{{question}}}`,
});

const chatbotFlow = ai.defineFlow(
  {
    name: 'chatbotFlow',
    inputSchema: ChatbotInputSchema,
    outputSchema: ChatbotOutputSchema,
  },
  async input => {
    // Using the default model to avoid quota issues.
    const response = await prompt(input);
    const answer = response.output;

    if (!answer) {
      const fallbackAnswer = "My apologies, operator. I'm having trouble accessing my core directives. Please try again.";
      return { answer: fallbackAnswer };
    }

    return { answer: answer };
  }
);
