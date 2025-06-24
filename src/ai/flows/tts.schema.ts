/**
 * @fileOverview Zod schemas and TypeScript types for the TTS flow.
 *
 * - TextToSpeechInputSchema - Zod schema for TTS input.
 * - TextToSpeechInput - TypeScript type for TTS input.
 * - TextToSpeechOutputSchema - Zod schema for TTS output.
 * - TextToSpeechOutput - TypeScript type for TTS output.
 */

import {z} from 'zod';

export const TextToSpeechInputSchema = z.object({
  text: z.string().describe('The text to convert to speech.'),
});
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

export const TextToSpeechOutputSchema = z.object({
  audioUrl: z.string().url().describe('A data URI for the generated audio.'),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;
