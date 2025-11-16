import * as admin from "firebase-admin";

function buildServiceAccountFromEnv(cfg: Record<string, any>) {
  return {
    type: cfg.FIREBASE_TYPE || "service_account",
    project_id: cfg.FIREBASE_PROJECT_ID,
    private_key_id: cfg.FIREBASE_PRIVATE_KEY_ID,
    private_key: (cfg.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    client_email: cfg.FIREBASE_CLIENT_EMAIL,
    client_id: cfg.FIREBASE_CLIENT_ID,
    auth_uri:
      cfg.FIREBASE_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
    token_uri: cfg.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url:
      cfg.FIREBASE_AUTH_PROVIDER_CERT_URL ||
      "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: cfg.FIREBASE_CLIENT_CERT_URL,
  } as admin.ServiceAccount;
}

/**
 * Initialize firebase-admin using provided `env` (Cloudflare Worker env) or process.env for local.
 * Returns the initialized `admin` instance. Call `initFirebase(env)` before using `admin.auth()`.
 */
export function initFirebase(env?: Record<string, any>) {
  const cfg = env || (process.env as any);

  if (!admin.apps.length) {
    const serviceAccount = buildServiceAccountFromEnv(cfg);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  return admin;
}

// Also export the `admin` object for direct usage if needed
export { admin };

export default initFirebase;
