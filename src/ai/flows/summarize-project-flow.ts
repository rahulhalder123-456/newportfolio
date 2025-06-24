'use server';
/**
 * @fileOverview An AI flow to generate a project summary from a GitHub repository URL.
 *
 * - summarizeProject - A function that generates a project summary.
 * - SummarizeProjectInput - The input type for the summarizeProject function.
 * - SummarizeProjectOutput - The return type for the summarizeProject function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

// Define the input schema for the flow
export const SummarizeProjectInputSchema = z.object({
  githubUrl: z.string().url().describe('The URL of the GitHub repository.'),
});
export type SummarizeProjectInput = z.infer<typeof SummarizeProjectInputSchema>;

// Define the output schema for the flow
export const SummarizeProjectOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the project, suitable for a portfolio entry.'),
});
export type SummarizeProjectOutput = z.infer<typeof SummarizeProjectOutputSchema>;

// Tool to get README content from a GitHub repository
const getReadmeContent = ai.defineTool(
    {
        name: 'getReadmeContent',
        description: 'Fetches the content of the README.md file from a public GitHub repository.',
        inputSchema: z.object({
            url: z.string().url().describe("The full URL of the GitHub repository."),
        }),
        outputSchema: z.string().describe("The content of the README.md file as a string, or an error message if not found."),
    },
    async (input) => {
        try {
            const url = new URL(input.url);
            const pathParts = url.pathname.split('/').filter(Boolean);
            if (pathParts.length < 2) {
                return "Error: Invalid GitHub repository URL. Could not extract owner and repo.";
            }
            const [owner, repo] = pathParts;

            const possibleBranches = ['main', 'master'];
            for (const branch of possibleBranches) {
                const readmeUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`;
                const response = await fetch(readmeUrl);
                if (response.ok) {
                    return await response.text();
                }
            }
            return "Error: Could not find README.md in 'main' or 'master' branch.";
        } catch (e: any) {
            return `Error: An exception occurred while fetching the README: ${e.message}`;
        }
    }
);

// Prompt to summarize the project
const summarizeProjectPrompt = ai.definePrompt({
    name: 'summarizeProjectPrompt',
    system: "You are an expert project manager and tech writer. Your task is to create a concise, engaging summary for a software project to be featured in a developer's portfolio. The summary should be based on the project's README file. If the README is unavailable or doesn't provide enough information, state that clearly.",
    tools: [getReadmeContent],
    input: { schema: SummarizeProjectInputSchema },
    output: { schema: SummarizeProjectOutputSchema },
    prompt: `Please generate a project summary for the repository at the following URL: {{{githubUrl}}}. Use the getReadmeContent tool to fetch the README.md file. The summary should be approximately 2-3 sentences long and highlight the project's purpose and key technologies.`,
});


// Define the main flow
const summarizeProjectFlow = ai.defineFlow(
  {
    name: 'summarizeProjectFlow',
    inputSchema: SummarizeProjectInputSchema,
    outputSchema: SummarizeProjectOutputSchema,
  },
  async (input) => {
    const {output} = await summarizeProjectPrompt(input);
    return output!;
  }
);


// Exported wrapper function to be called from the UI
export async function summarizeProject(input: SummarizeProjectInput): Promise<SummarizeProjectOutput> {
  return await summarizeProjectFlow(input);
}
