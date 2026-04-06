# AA Property Explorer

Next.js App Router site configured for Vercel serverless deployment.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## What it does

- Shows total property classes
- Shows total actions
- Lets users open the full property-class list
- Provides centered search with suggestions
- Opens property-class detail including fields, meanings, and action logic

## Build

```bash
npm run build
```

## Deploy to Vercel

1. Import this repository into Vercel.
2. Set the project root to `AA-report`.
3. Keep the framework preset as `Next.js`.
4. Deploy.

## Included serverless routes

- `GET /api/health`
- `GET /api/summary`
- `GET /api/property-classes?q=...`
- `GET /api/property-classes/[slug]`
