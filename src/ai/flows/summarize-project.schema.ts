import {z} from 'zod';

// Define the input schema for the flow
export const ProjectImageInputSchema = z.object({
  title: z.string().min(2).describe('The title of the project.'),
  summary: z.string().min(10).describe('A summary of the project.'),
});
export type ProjectImageInput = z.infer<typeof ProjectImageInputSchema>;

// Define the output schema for the flow
export const ProjectImageOutputSchema = z.object({
  imageUrl: z.string().url().describe('A data URI for the generated project image.'),
});
export type ProjectImageOutput = z.infer<typeof ProjectImageOutputSchema>;
