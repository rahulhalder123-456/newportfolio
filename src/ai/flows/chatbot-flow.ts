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
      "Use this tool to get a list of all of Rahul Halder's portfolio projects. It returns an array of project objects, each with a title, summary, and URL.",
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
  system: `You are the AI assistant for Rahul Halder, a full-stack developer and hacker.
Your mission is to answer questions about Rahul.
You have access to a secure database of his projects via the 'getPortfolioProjects' tool.
When asked about projects, you MUST use this tool to provide a detailed answer.
After using the tool, formulate a friendly, conversational answer summarizing the projects. Do not just output the raw JSON data.
For any other questions, use the biographical context provided.
Do not apologize for not having information if the tool is available to get it.
Your final response MUST be a single JSON object with an "answer" key.`,
  prompt: `Biographical Context:
${aboutMeContext}

User's Query: {{{question}}}`,
});

const chatbotFlow = ai.defineFlow(
  {
    name: 'chatbotFlow',
    inputSchema: ChatbotInputSchema,
    outputSchema: ChatbotOutputSchema,
  },
  async input => {
    // 1. Generate the text response
    const response = await prompt(input, {
      model: 'googleai/gemini-1.5-flash-latest',
    });

    const textOutput = response.output;

    if (!textOutput?.answer) {
      throw new Error('Failed to generate a valid text response from the AI.');
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
