# Quizda - Quiz Platform

A full-stack quiz application with React frontend and Cloudflare Worker backend.

## 🏗️ Tech Stack

- **Frontend**: React + Vite → Deploy to Vercel/Cloudflare Pages
- **Backend**: Hono + Cloudflare Workers (Deployed)
- **Database**: Cloudflare D1 (SQLite)
- **Authentication**: Firebase Auth + Custom Session Management
- **Storage**: Cloudflare R2 (Quiz Questions)
- **Caching**: Cloudflare KV

---

## 🚀 Quick Start

### Frontend Development

```bash
cd client
npm install
npm run dev
# Opens at http://localhost:5173
```

The frontend connects to the **deployed** Worker at: `https://quizda-worker-prod.b-jairam0512.workers.dev`

### Test Credentials

| Role | Username | Password |
|------|----------|----------|
| Contributor | `test_contributor` | `password123` |
| Attempter | `test_attempter` | `password123` |
| Admin | `test_admin` | `password123` |

### Backend Development

```bash
cd server
npm install
npm run dev
```

---

## 📐 Architecture

### System Overview

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│  React Client   │ ───▶ │ Cloudflare Worker│ ───▶ │  Cloudflare D1  │
│ (Vite + Axios)  │      │      (Hono)      │      │    (SQLite)     │
└─────────────────┘      └─────────┬────────┘      └─────────────────┘
                                   │
                                   ▼
                         ┌──────────────────┐
                         │  Cloudflare R2   │
                         │ (Question JSONs) │
                         └──────────────────┘
```

### Layered Design

1.  **Presentation Layer** (Components): UI rendering, no logic.
2.  **State Layer** (Hooks): Manages local state and side effects.
3.  **Business Layer** (Services): Domain logic, data transformation.
4.  **Data Layer** (Repositories/API): Database access and HTTP calls.

For detailed routing and API specifications, see [SYSTEM_DOCUMENTATION.md](./SYSTEM_DOCUMENTATION.md).

---

## 📦 Deployment

### Frontend (Cloudflare Pages)
1.  Build: `cd client && npm run build`
2.  Deploy: `npx wrangler pages deploy dist --project-name quizda-v2-client`

### Backend (Cloudflare Workers)
1.  Build: `cd server && npm run build:worker`
2.  Deploy: `npx wrangler deploy`

---

## 🧪 Testing Guide

### Authentication Testing
- **Persistence**: Refresh page, open new tab/window -> Session should persist.
- **Expiration**: Delete cookies -> Should refresh or logout.
- **Sync**: Logout in one tab -> Other tabs should logout.

### Common Scenarios
- **Registration**: Verify `firebase_uid` is stored in D1.
- **Quiz Creation**: Verify questions are saved to R2 and metadata to D1.

---

## 🔧 Troubleshooting & Known Issues

### Registration 400 Error (Fixed)
- **Issue**: Registration failed with "Email, username, and firebaseUid are required".
- **Cause**: Backend validation incorrectly enforced `firebaseUid` even for non-Firebase flows, and Frontend wasn't sending it in some cases.
- **Fix**: Made `firebaseUid` optional in backend validation and restored Firebase integration in frontend.

### CORS Issues
- Ensure `ALLOWED_ORIGINS` in `wrangler.toml` includes your client URL.
- Local development requires `http://localhost:5173`.

---

## ✅ Todo Checklist

- [x] Set up Firebase Auth
- [x] Set up Cloudflare R2
- [x] Set up Cloudflare D1
- [ ] Implement automated testing (Vitest)
- [ ] Add CI/CD pipelines
- [ ] Refactor legacy server code
