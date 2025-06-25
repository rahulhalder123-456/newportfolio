
'use server';

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { getErrorMessage } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

// Schema for validating project data from the client
const projectSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  summary: z.string().min(10, "Summary must be at least 10 characters."),
  url: z.string().url("Please enter a valid URL."),
  imageUrl: z.string(),
});

// TypeScript type for a project, including its database ID
export type Project = {
  id: string;
  title: string;
  summary: string;
  url: string;
  imageUrl: string;
  createdAt?: string; // Optional because it's added on the server
};

/**
 * Fetches all projects from the Firestore database, ordered by creation date.
 * @returns A promise that resolves to an array of projects.
 */
export async function getProjects(): Promise<Project[]> {
    try {
        // Order by 'createdAt' in descending order to get the newest projects first
        const snapshot = await db.collection('projects').orderBy('createdAt', 'desc').get();
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Project[];
    } catch (error) {
        console.error("Error getting projects:", getErrorMessage(error));
        // In case of an error, return an empty array to prevent the page from crashing.
        return [];
    }
}

/**
 * Fetches a single project by its ID from Firestore.
 * @param id - The unique identifier of the project document.
 * @returns A promise that resolves to the project object or null if not found.
 */
export async function getProject(id: string): Promise<Project | null> {
    try {
        const doc = await db.collection('projects').doc(id).get();
        if (!doc.exists) {
            return null;
        }
        return { id: doc.id, ...doc.data() } as Project;
    } catch (error) {
        console.error(`Error getting project ${id}:`, getErrorMessage(error));
        return null;
    }
}

/**
 * Adds a new project to the Firestore database.
 * @param data - The project data, validated against projectSchema.
 * @returns A promise that resolves to an object with a success flag or an error message.
 */
export async function addProject(data: z.infer<typeof projectSchema>) {
    const validatedFields = projectSchema.safeParse(data);
    if (!validatedFields.success) {
        return { error: 'Invalid data provided.' };
    }
    try {
        const projectData = {
            ...validatedFields.data,
            // Add a server-side timestamp for consistent ordering
            createdAt: new Date().toISOString()
        };
        await db.collection('projects').add(projectData);

        // Revalidate paths to ensure the new project appears immediately
        revalidatePath('/');
        revalidatePath('/projects');
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        return { error: getErrorMessage(error) };
    }
}

/**
 * Updates an existing project in the Firestore database.
 * @param id - The ID of the project to update.
 * @param data - The new project data.
 * @returns A promise that resolves to an object with a success flag or an error message.
 */
export async function updateProject(id: string, data: z.infer<typeof projectSchema>) {
    const validatedFields = projectSchema.safeParse(data);
    if (!validatedFields.success) {
        return { error: 'Invalid data provided.' };
    }
    try {
        await db.collection('projects').doc(id).update(validatedFields.data);

        // Revalidate all relevant paths
        revalidatePath('/');
        revalidatePath('/projects');
        revalidatePath('/admin');
        revalidatePath(`/admin/edit/${id}`);
        return { success: true };
    } catch (error) {
        return { error: getErrorMessage(error) };
    }
}

/**
 * Deletes a project from the Firestore database.
 * @param id - The ID of the project to delete.
 * @returns A promise that resolves to an object with a success flag or an error message.
 */
export async function deleteProject(id: string) {
    try {
        await db.collection('projects').doc(id).delete();
        
        // Revalidate paths to remove the deleted project from lists
        revalidatePath('/');
        revalidatePath('/projects');
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        return { error: getErrorMessage(error) };
    }
}
