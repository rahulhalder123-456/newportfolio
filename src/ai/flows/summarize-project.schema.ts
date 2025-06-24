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
