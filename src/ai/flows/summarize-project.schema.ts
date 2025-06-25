/**
 * @fileOverview Zod schemas and TypeScript types for the project image generation flow.
 */
import {z} from 'zod';

export const ProjectImageInputSchema = z.object({
  title: z.string().min(2).describe('The title of the project.'),
  summary: z.string().min(10).describe('A summary of the project.'),
});
export type ProjectImageInput = z.infer<typeof ProjectImageInputSchema>;

export const ProjectImageOutputSchema = z.object({
  // A data URI is not a valid URL according to Zod, so we just check for a string.
  imageUrl: z.string().describe('A data URI for the generated project image.'),
});
export type ProjectImageOutput = z.infer<typeof ProjectImageOutputSchema>;
