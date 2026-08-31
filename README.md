This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

1. Copy `.env.example` to `.env.local`.
2. Decide how you want to reach the backend (see **Backend setup** below) and set `BACKEND_ORIGIN` accordingly.
3. Run the dev server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

`pnpm dev` runs a quick health check against `BACKEND_ORIGIN` before starting Next.js. If the backend isn't reachable, you'll see a warning in the terminal immediately instead of discovering it later as a `502` on login.

## Backend setup

All `/api/*` requests are proxied to `BACKEND_ORIGIN` by `src/app/api/[...path]/route.ts` (see that file for why it's a route handler and not a `next.config.ts` rewrite). You have two options locally:

- **Run `miva-hubble-backend` locally** (recommended if you're touching backend code) and set `BACKEND_ORIGIN=http://localhost:7292` in `.env.local`.
- **Point at the deployed Render backend** and skip running it locally: `BACKEND_ORIGIN=https://miva-hubble-backend.onrender.com`. Note the Render free tier spins down when idle, so the first request after inactivity can take 30-60s to wake up.

If `BACKEND_ORIGIN` is missing, wrong, or unreachable, every `/api/*` call (including login) will fail with a `502 Bad Gateway`.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
