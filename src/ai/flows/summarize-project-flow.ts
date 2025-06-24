'use server';
/**
 * @fileOverview An AI flow to generate a project summary from a GitHub repository URL.
 *
 * - summarizeProject - A function that generates a project summary.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {
    SummarizeProjectInputSchema,
    type SummarizeProjectInput,
    SummarizeProjectOutputSchema,
    type SummarizeProjectOutput
} from './summarize-project.schema';

// Standalone function to fetch README content
const fetchReadmeContent = async (input: { url: string }): Promise<string> => {
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
};

// Tool to get README content from a GitHub repository (for potential future use by the AI)
const getReadmeContent = ai.defineTool(
    {
        name: 'getReadmeContent',
        description: 'Fetches the content of the README.md file from a public GitHub repository.',
        inputSchema: z.object({
            url: z.string().url().describe("The full URL of the GitHub repository."),
        }),
        outputSchema: z.string().describe("The content of the README.md file as a string, or an error message if not found."),
    },
    fetchReadmeContent
);

// New schema for the summarization prompt
const SummarizeTextSchema = z.object({
    readmeContent: z.string(),
});

// Prompt to summarize the project README content
const summarizeReadmePrompt = ai.definePrompt({
    name: 'summarizeReadmePrompt',
    model: 'googleai/gemini-1.5-flash-latest',
    system: "You are an expert project manager and tech writer. Your task is to create a concise, engaging summary for a software project to be featured in a developer's portfolio, based on the provided README file content. The summary should be approximately 2-3 sentences long and highlight the project's purpose and key technologies.",
    input: { schema: SummarizeTextSchema },
    output: { schema: SummarizeProjectOutputSchema },
    prompt: `Please generate a project summary from the following README content:\n\n{{{readmeContent}}}`,
});


// Define the main flow
const summarizeProjectFlow = ai.defineFlow(
  {
    name: 'summarizeProjectFlow',
    inputSchema: SummarizeProjectInputSchema,
    outputSchema: SummarizeProjectOutputSchema,
  },
  async (input) => {
    // Step 1: Fetch README content using the standalone function
    const readmeContent = await fetchReadmeContent({ url: input.githubUrl });
    
    // Step 2: Handle cases where the README could not be fetched
    if (readmeContent.startsWith('Error:')) {
        throw new Error(readmeContent);
    }

    // Step 3: Call the summarization prompt with the fetched content
    const {output} = await summarizeReadmePrompt({ readmeContent });
    return output!;
  }
);


// Exported wrapper function to be called from the UI
export async function summarizeProject(input: SummarizeProjectInput): Promise<SummarizeProjectOutput> {
  return await summarizeProjectFlow(input);
}
