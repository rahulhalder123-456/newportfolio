/**
 * @fileOverview Zod schemas and TypeScript types for the chatbot flow.
 *
 * - ChatbotInputSchema - Zod schema for chatbot input.
 * - ChatbotInput - TypeScript type for chatbot input.
 * - ChatbotOutputSchema - Zod schema for chatbot output.
 * - ChatbotOutput - TypeScript type for chatbot output.
 * - ProjectSchema - Zod schema for a single project.
 * - Project - TypeScript type for a single project.
 */

import {z} from 'zod';

export const ChatbotInputSchema = z.object({
  question: z.string().describe("The user's question for the chatbot."),
});
export type ChatbotInput = z.infer<typeof ChatbotInputSchema>;

// The audioUrl has been removed to reduce API calls and avoid quota issues.
export const ChatbotOutputSchema = z.object({
  answer: z.string().describe("The chatbot's answer."),
});
export type ChatbotOutput = z.infer<typeof ChatbotOutputSchema>;

export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  url: z.string().url(),
  imageUrl: z.string().url(),
  createdAt: z.string().optional(),
});
export type Project = z.infer<typeof ProjectSchema>;
