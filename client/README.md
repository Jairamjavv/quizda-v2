# Quizda Client

This client is a Vite + React + TypeScript app using MUI. It uses Design Tokens exported from `src/theme/designTokens.css` and `src/theme/designTokens.ts`.

Start the client after dependencies are installed:

```bash
cd client
npm install
npm run dev
```

Notes:

- API calls are proxied to the server under `/api` (Vite proxy configured for port 4000).
- Theme switching toggles `html[data-theme]` attribute between `light` and `dark` and uses the tokens defined in `designTokens.css`.
