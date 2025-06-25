
'use server';
/**
 * @fileOverview A "GenZ" AI chatbot flow that provides text and voice responses.
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
import { textToSpeech } from './tts-flow';
import { getErrorMessage } from '@/lib/utils';

export async function chatWithVibeBot(
  input: ChatbotInput
): Promise<ChatbotOutput> {
  return await chatbotFlow(input);
}

const genZPrompt = ai.definePrompt({
  name: 'genZPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: { schema: z.object({ query: z.string() }) },
  prompt: `You are a super chill, helpful AI assistant with a GenZ personality. 
      Your name is 'VibeBot'. Keep your answers short, snappy, and use modern slang.
      Like, don't be basic. If a question is mid, just say so.
      If it's a vibe, let them know. Big yikes to long, boring answers.
      Keep it 100.
      
      The user asked: "{{query}}"`,
  config: {
    temperature: 0.8, // A bit more creative with slang
  },
});

const chatbotFlow = ai.defineFlow(
  {
    name: 'chatbotFlow',
    inputSchema: ChatbotInputSchema,
    outputSchema: ChatbotOutputSchema,
  },
  async (input) => {
    // 1. Get the text response from the AI
    const llmResponse = await genZPrompt(input);
    const answer = llmResponse.text;

    // An empty response from the LLM is valid. An error will throw an exception
    // which is handled by the frontend, so no need for an explicit check here.

    // 2. Generate audio for the response
    try {
      const ttsResult = await textToSpeech({ text: answer });
      return { answer, audioUrl: ttsResult.audioUrl };
    } catch (error) {
      console.error(`TTS generation failed: ${getErrorMessage(error)}`);
      // Fail gracefully: still return the text answer even if audio fails
      return { answer };
    }
  }
);
