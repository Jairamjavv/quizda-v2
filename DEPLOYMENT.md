# Quizda v2 - Deployment Guide

## 🚀 Live Deployments

### Frontend (Client)

- **Production URL**: https://quizda-v2-client.pages.dev
- **Platform**: Cloudflare Pages
- **Note**: Each deployment creates a unique preview URL (e.g., `https://[hash].quizda-v2-client.pages.dev`)

### Backend (API)

- **Production URL**: https://quizda-worker-prod.b-jairam0512.workers.dev
- **Platform**: Cloudflare Workers
- **Database**: Cloudflare D1
- **Storage**: Cloudflare R2

## 📦 Deployment Instructions

### Deploy Client to Cloudflare Pages

1. **Build the client**:

   ```bash
   cd client
   npm run build
   ```

2. **Deploy to Cloudflare Pages**:

   ```bash
   npx wrangler pages deploy dist --project-name quizda-v2-client --branch main
   ```

3. **Set environment variables** in Cloudflare Pages dashboard:
   - Go to https://dash.cloudflare.com → Pages → quizda-v2-client → Settings → Environment Variables
   - Add all variables from `client/.env.production`

### Deploy Server to Cloudflare Workers

1. **Build the worker**:

   ```bash
   cd server
   npm run build:worker
   ```

2. **Deploy to Cloudflare Workers**:

   ```bash
   npx wrangler deploy --env production
   ```

3. **Run database migrations** (if needed):
   ```bash
   npx drizzle-kit generate
   npx wrangler d1 execute quizda-d1-db --remote --file=./drizzle/XXXX_migration.sql
   ```

## 🔧 Configuration

### CORS Settings

The worker is configured to allow requests from:

- `https://quizda-v2-client.pages.dev` (production)
- `https://*.quizda-v2-client.pages.dev` (preview deployments)
- `http://localhost:5173` (local development)

### Firebase Authentication

- Project: `quizda-1997`
- Auth enabled: Email/Password
- Authorized domains configured in Firebase Console

## 🔐 Environment Variables

### Client (.env.production)

```
VITE_API_BASE_URL=https://quizda-worker-prod.b-jairam0512.workers.dev
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
```

### Server (wrangler.toml)

```
[env.production]
name = "quizda-worker-prod"
compatibility_date = "2024-11-15"

[[env.production.d1_databases]]
binding = "DB"
database_name = "quizda-d1-db"
database_id = "388dd96b-c43b-470a-afec-87bf02595fe5"
```

## 🧪 Testing Deployment

After deployment, test the following:

1. Visit https://quizda-v2-client.pages.dev
2. Try registering a new user (creates Firebase user + D1 record)
3. Login with the registered user
4. Navigate through dashboard based on role

## 📝 Notes

- Client builds to `client/dist/` directory
- Worker builds to `server/dist/worker.mjs`
- Database schema managed with Drizzle ORM
- All deployments use production Firebase project
