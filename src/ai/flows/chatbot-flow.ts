'use server';
/**
 * @fileOverview A chatbot AI flow to answer questions about Rahul Halder and his projects.
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
import {getProjects} from '@/app/projects/actions';

// Tool for the AI to get project information
const getPortfolioProjects = ai.defineTool(
  {
    name: 'getPortfolioProjects',
    description:
      'Get a list of all portfolio projects, including their titles and summaries.',
    outputSchema: z.array(
      z.object({
        title: z.string(),
        summary: z.string(),
        url: z.string().url(),
      })
    ),
  },
  async () => {
    // We only need specific fields for the AI, not the full project object
    const projects = await getProjects();
    return projects.map(({title, summary, url}) => ({title, summary, url}));
  }
);

export async function askChatbot(input: ChatbotInput): Promise<ChatbotOutput> {
  return chatbotFlow(input);
}

const aboutMeContext = `I'm a full-stack developer with a hacker mindset, passionate about building beautiful, functional, and secure web applications. My expertise spans across the stack, from crafting intuitive front-end experiences with React and Next.js to architecting robust back-end systems with Node.js. I thrive on solving complex problems, exploring system intricacies, and continuously learning new technologies to push the boundaries of what's possible. My skills include React, Next.js, Node.js, TypeScript, Cybersecurity, and AI/ML.`;

const prompt = ai.definePrompt({
  name: 'chatbotPrompt',
  // Using a more powerful model better suited for tool use.
  model: 'googleai/gemini-1.5-pro-latest',
  tools: [getPortfolioProjects],
  input: {schema: ChatbotInputSchema},
  output: {schema: z.string()},
  system: `You are an AI assistant for a developer named Rahul Halder.
- Your persona is a helpful, slightly mysterious "hacker".
- You have two sources of information:
  1.  Context about Rahul: "${aboutMeContext}".
  2.  A tool named "getPortfolioProjects" to look up his work.
- Follow these rules:
  1. If the user asks about Rahul's projects, work, or creations, you MUST use the getPortfolioProjects tool.
  2. Answer any other questions based on the provided context about Rahul.
  3. Do NOT mention your tools. Just use them and answer the question directly.
  4. If a question is unrelated to Rahul or his projects, say "That information is beyond my current access parameters."
  5. Your final output must only be the text of your answer.`,
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

    return {answer: answer};
  }
);
