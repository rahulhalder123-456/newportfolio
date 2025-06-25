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
  audioUrl: z
    .string()
    .url()
    .optional()
    .describe('A data URI for the generated audio of the answer.'),
});
export type ChatbotOutput = z.infer<typeof ChatbotOutputSchema>;

// This is the new schema for the direct output of the prompt itself.
// Asking for a structured object is more reliable than a raw string.
export const ChatbotPromptOutputSchema = z.object({
    answer: z.string().describe("The text of the AI's response to the user's question.")
});
export type ChatbotPromptOutput = z.infer<typeof ChatbotPromptOutputSchema>;
