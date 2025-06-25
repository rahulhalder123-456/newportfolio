/**
 * @fileOverview Zod schemas and TypeScript types for the VibeBot chatbot flow.
 */
import { z } from 'zod';

export const ChatbotInputSchema = z.object({
  query: z.string().min(1).describe('The user\'s question for the chatbot.'),
});
export type ChatbotInput = z.infer<typeof ChatbotInputSchema>;

export const ChatbotOutputSchema = z.object({
  answer: z.string().describe('The chatbot\'s GenZ-style answer.'),
  audioUrl: z.string().optional().describe('A data URI for the generated audio.'),
});
export type ChatbotOutput = z.infer<typeof ChatbotOutputSchema>;
