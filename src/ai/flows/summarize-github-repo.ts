'use server';

/**
 * @fileOverview A flow for summarizing GitHub repositories by creating a name and description.
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
  title: z.string().describe("A creative and short title for the repository, based on its content."),
  summary: z.string().describe('A summary of the GitHub repository based on its README file.'),
});
export type SummarizeGithubRepoOutput = z.infer<typeof SummarizeGithubRepoOutputSchema>;

export async function summarizeGithubRepo(input: SummarizeGithubRepoInput): Promise<SummarizeGithubRepoOutput> {
  return summarizeGithubRepoFlow(input);
}

const getReadmeContent = ai.defineTool({
  name: 'getReadmeContent',
  description: 'Fetches the content of the README file from a GitHub repository.',
  inputSchema: z.object({
    repoUrl: z.string().describe('The URL of the GitHub repository. e.g. https://github.com/owner/repo'),
  }),
  outputSchema: z.string(),
}, async (input) => {
  try {
    const url = new URL(input.repoUrl);
    const pathParts = url.pathname.split('/').filter(p => p);
    if (pathParts.length < 2) {
      throw new Error('Invalid GitHub repository URL. Expected format: https://github.com/owner/repo');
    }
    const owner = pathParts[0];
    const repo = pathParts[1].replace(/\.git$/, '');

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/readme`;
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3.raw',
        'User-Agent': 'Firebase-Studio-Agent'
      }
    });

    if (!response.ok) {
        if (response.status === 404) {
            return `I was unable to retrieve the readme content from the provided URL. The repository may be private, or it might not have a README file.`;
        }
        return `Failed to fetch README from GitHub API: ${response.status} ${response.statusText}. Please check if the repository is public and the URL is correct.`;
    }

    const content = await response.text();
    if (!content.trim()) {
        return "The README file for this repository is empty.";
    }
    return content;
  } catch (error: any) {
    console.error('Error fetching README:', error);
    return `An unexpected error occurred while trying to fetch the README: ${error.message}`;
  }
});

const summarizeRepoPrompt = ai.definePrompt({
  name: 'summarizeRepoPrompt',
  tools: [getReadmeContent],
  input: {schema: SummarizeGithubRepoInputSchema},
  output: {schema: SummarizeGithubRepoOutputSchema},
  prompt: `You are a seasoned software developer and technical writer. Your task is to analyze a GitHub repository and generate a creative title and a concise summary.

1.  Use the getReadmeContent tool to fetch the content of the README file for the given repoUrl.
2.  Based on the README content, create a short, catchy title for the project. If the README is uninformative or unavailable, create a title based on the repository URL (e.g., 'owner/repo').
3.  Write a clear and concise summary that explains what the project is about.
4.  If you cannot retrieve the README content, the tool will return a message explaining why. Use this message as the summary.

Repo URL: {{{repoUrl}}}
`,
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
