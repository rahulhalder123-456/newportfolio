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
  ProjectSchema,
} from './chatbot.schema';
import {textToSpeech} from './tts-flow';
import {getProjects} from '@/app/projects/actions';

export async function askChatbot(input: ChatbotInput): Promise<ChatbotOutput> {
  return chatbotFlow(input);
}

const aboutMeContext = `I'm a full-stack developer with a hacker mindset, passionate about building beautiful, functional, and secure web applications. My expertise spans across the stack, from crafting intuitive front-end experiences with React and Next.js to architecting robust back-end systems with Node.js. I thrive on solving complex problems, exploring system intricacies, and continuously learning new technologies to push the boundaries of what's possible. My skills include React, Next.js, Node.js, TypeScript, Cybersecurity, and AI/ML.`;

const getPortfolioProjects = ai.defineTool(
  {
    name: 'getPortfolioProjects',
    description:
      'Gets the list of projects from the portfolio database to answer questions about them.',
    inputSchema: z.void(),
    outputSchema: z.array(ProjectSchema),
  },
  async () => {
    return await getProjects();
  }
);

const prompt = ai.definePrompt({
  name: 'chatbotPrompt',
  input: {schema: ChatbotInputSchema},
  output: {schema: z.object({answer: z.string()})},
  tools: [getPortfolioProjects],
  prompt: `You are a helpful and friendly personal assistant for Rahul Halder.
Your purpose is to answer questions about Rahul. You can use your biographical knowledge or use tools to access information from a database.
If the user asks about Rahul's projects, use the getPortfolioProjects tool to find the answer.
Do not make up information or answer questions not related to Rahul. If the answer is not in the text or from a tool, politely say that you don't have that specific information.
Keep your answers concise, friendly, and conversational.

Here is the biographical information about Rahul:
${aboutMeContext}

User's Question: {{{question}}}`,
});

const chatbotFlow = ai.defineFlow(
  {
    name: 'chatbotFlow',
    inputSchema: ChatbotInputSchema,
    outputSchema: ChatbotOutputSchema,
  },
  async input => {
    // 1. Generate the text response
    const {output: textOutput} = await prompt(input, {
      model: 'googleai/gemini-1.5-flash-latest',
    });

    if (!textOutput?.answer) {
      throw new Error('Failed to generate a text response.');
    }

    // 2. Generate the audio for the text response
    const {audioUrl} = await textToSpeech({text: textOutput.answer});

    // 3. Return both
    return {
      answer: textOutput.answer,
      audioUrl: audioUrl,
    };
  }
);
