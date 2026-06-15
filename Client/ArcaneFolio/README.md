# Arcane Folio

Arcane Folio is a Next.js web app deployed on Vercel.

## Development

```bash
npm run dev
```

Open http://localhost:3000 to view the app.

## Firebase Auth

Copy `.env.example` to `.env.local` and fill in your Firebase web app config. In Firebase Console, enable Email/Password and Google providers under Authentication.

For production, add the same `NEXT_PUBLIC_FIREBASE_*` values in Vercel project environment variables.

## API Routes

This app uses Next.js API routes under `pages/api`. The spell browser is served by `pages/api/spells.ts` from JSON data in `data/`, so no separate backend project is required for Vercel.

## Production Build

```bash
npm run build
```

## Deployment

This project is linked to Vercel. Deploy production changes with:

```bash
npx vercel --prod
```
