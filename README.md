# Quizda - Quiz Platform

A full-stack quiz application with React frontend and Cloudflare Worker backend.

## 🏗️ Tech Stack

- **Frontend**: React + Vite → Deploy to Vercel
- **Backend**: Hono + Cloudflare Workers (Deployed)
- **Database**: Cloudflare D1
- **Authentication**: Firebase Auth
- **Storage**: Cloudflare R2 (Quiz Questions)
- **Caching**: Cloudflare KV

## 🚀 Quick Start

### Frontend Development

```bash
cd client
npm install
npm run dev
# Opens at http://localhost:5173
```

The frontend connects to the **deployed** Worker at:
`https://quizda-worker-prod.b-jairam0512.workers.dev`

### Test Credentials

| Role        | Username           | Password      |
| ----------- | ------------------ | ------------- |
| Contributor | `test_contributor` | `password123` |
| Attempter   | `test_attempter`   | `password123` |
| Admin       | `test_admin`       | `password123` |

### Backend Deployment (When Needed)

```bash
cd server
npm install
npm run build:worker
npx wrangler deploy
```

## 📚 Documentation

### Deployment Checklist

Your Quizda app is configured to connect the React frontend (local or Vercel) to the deployed Cloudflare Worker.

- Cloudflare Worker deployed at `https://quizda-worker-prod.b-jairam0512.workers.dev`
- CORS configured for `localhost:5173` and Vercel
- Test users hardcoded in Worker (3 users)
- All API endpoints implemented (`/api/login`, `/api/register`, `/api/quizzes`, etc.)
- Frontend configured to connect to deployed Worker
- API service layer with TypeScript types
- Error handling and interceptors

### Getting Started

Your Quizda application is now configured to use **Cloudflare Workers** with **Hono** as the backend framework. This document provides all the information you need to get started.

#### Backend (Server)

- **Hono Framework** - Lightweight web framework optimized for Cloudflare Workers
- **CORS Middleware** - Properly configured to accept requests from your frontend and future Vercel deployment
- **API Endpoints**:
  - `GET /api/health` - Health check
  - `GET /api/hello` - Test endpoint (returns: `{ message: "Hello from Cloudflare Worker" }`)
  - `POST /api/login` - User authentication with mock data
  - `POST /api/register` - User registration with mock data
  - `POST /api/forgot-password` - Password reset request
  - `GET /api/quizzes` - Fetch all quizzes

#### Frontend (Client)

- **Axios Configuration** (`client/src/services/api.ts`):

  - Automatic base URL detection (dev: `http://localhost:8787`, prod: `https://quizda-worker-prod.b-jairam0512.workers.dev`)
  - Request/response interceptors for logging
  - Automatic token management in Authorization header
  - Error handling with 401 redirect

- **API Service Layer** (`client/src/services/quizApi.ts`):

  - Typed API functions for all endpoints
  - Proper error handling and status code management
  - Token storage in localStorage

- **Demo Component** (`client/src/components/ApiConnectionDemo.tsx`):
  - Test connectivity with buttons to call `/api/hello` and `/api/health`

### Cloudflare Setup

Quizda uses a **deployed** Cloudflare Worker as the backend. The React frontend connects directly to the Worker at `https://quizda-worker-prod.b-jairam0512.workers.dev` - no local backend server needed!

#### Architecture

```
React Frontend    → Local Dev: http://localhost:5173
(Vite + Axios)    → Production: Vercel

Cloudflare Worker (Deployed) → Always Live
- /api/hello, /api/health
- /api/login, /api/register
- /api/forgot-password
- /api/quizzes
- CORS middleware & auth
```

#### Quick Start

1. Frontend Setup (Client)

```bash
cd client
npm install
npm run dev
# Opens at http://localhost:5173
```

2. Test Credentials (Hardcoded)

| Role        | Username           | Password      |
| ----------- | ------------------ | ------------- |
| Contributor | `test_contributor` | `password123` |
| Attempter   | `test_attempter`   | `password123` |

### Implementation Summary

#### Completed Tasks

- **wrangler.toml Configuration**

  - Set worker name: `quizda-worker`
  - Set compatibility_date: `2025-11-16`
  - Enabled nodejs_compat: `true`
  - Configured development environment
  - Configured production environment

- **Cloudflare Worker with Hono**

  - Created `/api/hello` - Returns `{ message: "Hello from Cloudflare Worker" }`
  - Implemented `/api/health` - Health check endpoint
  - Implemented `/api/login` - User authentication (POST)
    - Validates credentials
    - Returns user data and token
    - Status codes: 200, 400, 401, 403
  - Implemented `/api/register` - User registration (POST)
    - Validates email and username uniqueness
    - Creates new users
    - Status codes: 201, 400, 409
  - Implemented `/api/forgot-password` - Password reset (POST)
    - Secure email verification
    - Returns consistent response for security
    - Status code: 200
  - Existing `/api/quizzes` - Quiz listing (GET)
    - Returns mock quiz data
    - Fully populated with questions
  - CORS middleware configured
    - Allows localhost and production origins
    - Proper preflight request handling
    - Authorization header support

- **Frontend API Integration**
  - Axios Configuration
    - Automatic environment detection
    - Base URL management (dev: `http://localhost:8787`)
    - Request interceptors for token injection
    - Response interceptors for error handling
    - Automatic 401 redirect to login

### Server Notes

The worker uses an `ALLOWED_ORIGINS` allowlist to determine which origins are allowed to access API endpoints (CORS). By default the worker allows:

`https://quizda-worker-prod.b-jairam0512.workers.dev`

Set `ALLOWED_ORIGINS` in your `wrangler.toml` or locally during development.

1. Set in `wrangler.toml` (per-environment):

```toml
[env.production]
vars = { ALLOWED_ORIGINS = "https://app.quizda.example.com,https://quizda-worker-prod.b-jairam0512.workers.dev" }

[env.dev]
vars = { ALLOWED_ORIGINS = "http://localhost:5173,https://quizda-worker-prod.b-jairam0512.workers.dev" }
```

2. Set locally (bash/zsh) before running the worker or building:

```bash
# allow local dev and the worker origin
export ALLOWED_ORIGINS="http://localhost:5173,https://quizda-worker-prod.b-jairam0512.workers.dev"

# then run the worker build or start your local server
cd server
npm run build:worker
# or to run the node bundle (after building):
PORT=4001 npm start
```

---

End of README
