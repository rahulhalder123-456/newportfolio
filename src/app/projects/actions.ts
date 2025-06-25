
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
  imageUrl: z.string().optional(),
  featured: z.boolean().optional(),
});

// TypeScript type for a project, including its database ID
export type Project = {
  id: string;
  title: string;
  summary: string;
  url: string;
  imageUrl: string;
  createdAt?: string; // Optional because it's added on the server
  featured?: boolean;
};

/**
 * Creates a more helpful error message for common Firebase connection issues.
 * @param error - The original error caught.
 * @returns A user-friendly error string.
 */
function getEnhancedFirebaseErrorMessage(error: unknown): string {
  const message = getErrorMessage(error);
  // This specific string indicates a private key format issue, common on Vercel.
  if (message.includes('DECODER routines::unsupported') || message.includes('Getting metadata from plugin failed')) {
    return 'Firebase connection failed. This is likely due to an incorrect private key format in your environment variables. Please generate a new private key in your Firebase project settings and update the FIREBASE_PRIVATE_KEY value in your deployment settings. Make sure to replace all newline characters with the literal string "\\n".';
  }
  return message;
}


/**
 * Fetches all projects from the Firestore database, ordered by creation date.
 * @returns A promise that resolves to an array of projects.
 */
export async function getProjects(): Promise<Project[]> {
    try {
        const snapshot = await db.collection('projects').orderBy('createdAt', 'desc').get();
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Project[];
    } catch (error) {
        // Provide a clear error during server-side rendering if the connection fails.
        throw new Error(getEnhancedFirebaseErrorMessage(error));
    }
}

/**
 * Fetches the top 3 featured projects from the Firestore database.
 * @returns A promise that resolves to an array of featured projects.
 */
export async function getFeaturedProjects(): Promise<Project[]> {
    try {
        const snapshot = await db.collection('projects')
            .where('featured', '==', true)
            .get();

        if (snapshot.empty) {
            return [];
        }

        const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Project[];

        // Sort by creation date descending in-memory and then take the top 3
        return projects
            .sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
            })
            .slice(0, 3);
    } catch (error) {
        throw new Error(getEnhancedFirebaseErrorMessage(error));
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
        throw new Error(getEnhancedFirebaseErrorMessage(error));
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
        if (validatedFields.data.featured) {
            const featuredSnapshot = await db.collection('projects').where('featured', '==', true).get();
            if (featuredSnapshot.size >= 3) {
                return { error: 'You can only feature a maximum of 3 projects. Please unfeature another project first.' };
            }
        }

        const projectData = {
            ...validatedFields.data,
            featured: validatedFields.data.featured || false,
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
        return { error: getEnhancedFirebaseErrorMessage(error) };
    }
}

/**
 * Updates an existing project in the Firestore database.
 * @param id - The ID of the project to update.
 * @param data - The new project data.
 *returns A promise that resolves to an object with a success flag or an error message.
 */
export async function updateProject(id: string, data: z.infer<typeof projectSchema>) {
    const validatedFields = projectSchema.safeParse(data);
    if (!validatedFields.success) {
        return { error: 'Invalid data provided.' };
    }
    try {
        const docRef = db.collection('projects').doc(id);
        const doc = await docRef.get();
        if (!doc.exists) {
            return { error: 'Project not found.' };
        }
        
        const currentProject = doc.data() as Project;
        if (validatedFields.data.featured && !currentProject.featured) {
            const featuredSnapshot = await db.collection('projects').where('featured', '==', true).get();
            if (featuredSnapshot.size >= 3) {
                return { error: 'You can only feature a maximum of 3 projects. Please unfeature another project first.' };
            }
        }
        
        const updateData: Partial<Project> = { ...validatedFields.data };
        
        await docRef.update(updateData);

        // Revalidate all relevant paths
        revalidatePath('/');
        revalidatePath('/projects');
        revalidatePath('/admin');
        revalidatePath(`/projects/${id}`);
        revalidatePath(`/admin/edit/${id}`);
        return { success: true };
    } catch (error) {
        return { error: getEnhancedFirebaseErrorMessage(error) };
    }
}

/**
 * Toggles the 'featured' status of a project.
 * @param id The ID of the project to update.
 * @param featured The new featured status.
 * @returns A promise that resolves to an object with a success flag or an error message.
 */
export async function toggleProjectFeatured(id: string, featured: boolean) {
    try {
        if (featured) {
            const featuredSnapshot = await db.collection('projects').where('featured', '==', true).get();
            if (featuredSnapshot.size >= 3) {
                return { error: 'You can only feature a maximum of 3 projects.' };
            }
        }

        const docRef = db.collection('projects').doc(id);
        await docRef.update({ featured });

        revalidatePath('/');
        revalidatePath('/admin');
        revalidatePath('/projects');
        return { success: true };
    } catch (error) {
        return { error: getEnhancedFirebaseErrorMessage(error) };
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
        return { error: getEnhancedFirebaseErrorMessage(error) };
    }
}
