import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
let firebaseApp: admin.app.App;

export function initializeFirebase(env: any) {
  if (!firebaseApp) {
    // For Cloudflare Workers, we'll use environment variables
    // In production, use secrets binding instead
    const serviceAccount = {
      type: "service_account",
      project_id: env.FIREBASE_PROJECT_ID || "quizda-1997",
      private_key_id: env.FIREBASE_PRIVATE_KEY_ID,
      private_key: env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      client_email: env.FIREBASE_CLIENT_EMAIL,
      client_id: env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: env.FIREBASE_CLIENT_CERT_URL,
    };

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
  }
  return firebaseApp;
}

export function getAuth() {
  return admin.auth();
}

// Verify Firebase ID token
export async function verifyToken(token: string) {
  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

// Create a new user in Firebase
export async function createFirebaseUser(
  email: string,
  password: string,
  username: string
) {
  try {
    const userRecord = await getAuth().createUser({
      email,
      password,
      displayName: username,
    });
    return userRecord;
  } catch (error: any) {
    throw new Error(error.message || "Failed to create user");
  }
}

// Get user by email
export async function getUserByEmail(email: string) {
  try {
    const userRecord = await getAuth().getUserByEmail(email);
    return userRecord;
  } catch (error) {
    return null;
  }
}

// Delete a Firebase user
export async function deleteFirebaseUser(uid: string) {
  try {
    await getAuth().deleteUser(uid);
    return true;
  } catch (error) {
    return false;
  }
}
