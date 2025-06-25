'use server';
/**
 * @fileOverview A chatbot AI flow to answer questions about Rahul Halder, with Text-to-Speech capability.
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
import {textToSpeech} from './tts-flow';
import {getErrorMessage} from '@/lib/utils';

export async function askChatbot(input: ChatbotInput): Promise<ChatbotOutput> {
  return chatbotFlow(input);
}

const aboutMeContext = `I'm a full-stack developer with a hacker mindset, passionate about building beautiful, functional, and secure web applications. My expertise spans across the stack, from crafting intuitive front-end experiences with React and Next.js to architecting robust back-end systems with Node.js. I thrive on solving complex problems, exploring system intricacies, and continuously learning new technologies to push the boundaries of what's possible. My skills include React, Next.js, Node.js, TypeScript, Cybersecurity, and AI/ML.`;

const prompt = ai.definePrompt({
  name: 'chatbotPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: ChatbotInputSchema},
  output: {schema: z.string().nullable()},
  system: `You are an AI assistant for a developer named Rahul Halder.
- Your persona is a helpful, slightly mysterious "hacker".
- If the user provides a simple greeting like "hi" or "hello", respond with a simple, in-persona greeting like "Greetings, operator."
- For other questions, answer them based on this context about Rahul: "${aboutMeContext}".
- If a question is about Rahul's specific projects, explain that you can only talk about his skills and general experience.
- If a question is unrelated to Rahul, his skills, or his work, say "That information is beyond my current access parameters."
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
    const response = await prompt(input);
    const answer = response.output;

    if (!answer) {
      const fallbackAnswer =
        "My apologies, operator. I'm having trouble accessing my core directives. Please try again.";
      return {answer: fallbackAnswer};
    }

    try {
      const ttsResult = await textToSpeech({text: answer});
      return {answer, audioUrl: ttsResult.audioUrl};
    } catch (error) {
      console.error(`TTS generation failed: ${getErrorMessage(error)}`);
      // Return the text answer even if TTS fails, so the chat doesn't break.
      return {answer};
    }
  }
);
