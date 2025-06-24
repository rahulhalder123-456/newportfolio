import admin from 'firebase-admin';

// This prevents initialization of the app multiple times in a serverless environment
if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("FIREBASE_PRIVATE_KEY environment variable not set.");
    }
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // The private key from the .env file needs newlines to be escaped (`\n`)
        // so we replace them back to actual newline characters here.
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
  }
}

// Export the firestore database instance
export const db = admin.firestore();
