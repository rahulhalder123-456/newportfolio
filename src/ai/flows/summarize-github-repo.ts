'use server';

/**
 * @fileOverview A flow for summarizing GitHub repositories by extracting key snippets from the 'readme.md' file.
 *
 * - summarizeGithubRepo - A function that handles the summarization process.
 * - SummarizeGithubRepoInput - The input type for the summarizeGithubRepo function.
 * - SummarizeGithubRepoOutput - The return type for the summarizeGithubRepo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeGithubRepoInputSchema = z.object({
  repoUrl: z
    .string()
    .describe('The URL of the GitHub repository.'),
});
export type SummarizeGithubRepoInput = z.infer<typeof SummarizeGithubRepoInputSchema>;

const SummarizeGithubRepoOutputSchema = z.object({
  summary: z.string().describe('A summary of the GitHub repository.'),
});
export type SummarizeGithubRepoOutput = z.infer<typeof SummarizeGithubRepoOutputSchema>;

export async function summarizeGithubRepo(input: SummarizeGithubRepoInput): Promise<SummarizeGithubRepoOutput> {
  return summarizeGithubRepoFlow(input);
}

const getReadmeContent = ai.defineTool({
  name: 'getReadmeContent',
  description: 'Fetches the content of the readme.md file from a GitHub repository.',
  inputSchema: z.object({
    repoUrl: z.string().describe('The URL of the GitHub repository.'),
  }),
  outputSchema: z.string(),
}, async (input) => {
  try {
    const readmeUrl = `${input.repoUrl}/blob/main/readme.md`;
    const response = await fetch(readmeUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch readme.md: ${response.status} ${response.statusText}`);
    }

    return await response.text();
  } catch (error: any) {
    console.error('Error fetching readme.md:', error);
    return `Error fetching readme.md: ${error.message}`;
  }
});

const summarizeRepoPrompt = ai.definePrompt({
  name: 'summarizeRepoPrompt',
  tools: [getReadmeContent],
  input: {schema: SummarizeGithubRepoInputSchema},
  output: {schema: SummarizeGithubRepoOutputSchema},
  prompt: `You are a seasoned software developer and technical writer.  Summarize the key aspects of the GitHub repository based on its readme.md content.

  Use the getReadmeContent tool to get the content of the readme.md file from the GitHub repository.

  Repo URL: {{{repoUrl}}}
  Summary:`, 
});

const summarizeGithubRepoFlow = ai.defineFlow(
  {
    name: 'summarizeGithubRepoFlow',
    inputSchema: SummarizeGithubRepoInputSchema,
    outputSchema: SummarizeGithubRepoOutputSchema,
  },
  async input => {
    const {output} = await summarizeRepoPrompt(input);
    return output!;
  }
);
