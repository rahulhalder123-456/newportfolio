/**
 * @fileOverview Zod schemas and TypeScript types for the chatbot flow.
 *
 * - ChatbotInputSchema - Zod schema for chatbot input.
 * - ChatbotInput - TypeScript type for chatbot input.
 * - ChatbotOutputSchema - Zod schema for chatbot output.
 * - ChatbotOutput - TypeScript type for chatbot output.
 */

import {z} from 'zod';

export const ChatbotInputSchema = z.object({
  question: z.string().describe("The user's question for the chatbot."),
});
export type ChatbotInput = z.infer<typeof ChatbotInputSchema>;

export const ChatbotOutputSchema = z.object({
  answer: z.string().describe("The chatbot's answer."),
});
export type ChatbotOutput = z.infer<typeof ChatbotOutputSchema>;
