
import admin from 'firebase-admin';

// This prevents initialization of the app multiple times in a serverless environment
if (!admin.apps.length) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("Firebase setup error: FIREBASE_PRIVATE_KEY environment variable is not set. Please check your deployment settings.");
    }
    const projectId = process.env.FIREBASE_PROJECT_ID;
    if (!projectId) {
        throw new Error("Firebase setup error: FIREBASE_PROJECT_ID environment variable is not set. Please check your deployment settings.");
    }
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    if (!clientEmail) {
        throw new Error("Firebase setup error: FIREBASE_CLIENT_EMAIL environment variable is not set. Please check your deployment settings.");
    }

    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: projectId,
          clientEmail: clientEmail,
          // The private key from the .env file needs newlines to be escaped (`\n`)
          // so we replace them back to actual newline characters here.
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
    } catch (error: any) {
      // Provide a general error if initialization fails immediately.
      // Specific connection errors will be handled in the action files.
      throw new Error(`Firebase initialization failed: ${error.message}. Ensure all FIREBASE_* environment variables are correctly set.`);
    }
}

// Export the firestore database instance
export const db = admin.firestore();
