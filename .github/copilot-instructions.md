## Quick orientation

This repo is a single project with a React front-end and an Express + tRPC backend bundled together.
Top-level layout: `client/` (React + Vite), `server/` (Express + tRPC), `drizzle/` (DB schema & migrations), and `shared/` for cross-cutting types/constants.

## How to run & build (developer workflows)

- Development: `pnpm dev` (see `package.json` -> `scripts.dev`). This runs `tsx watch server/_core/index.ts` and starts Vite via the server in dev mode.
- Build: `pnpm build` runs `vite build` for the client and bundles the server entry (`server/_core/index.ts`) with esbuild into `dist/`.
- Start (production): `pnpm start` runs `node dist/index.js`.
- DB migrations: `pnpm run db:push` calls `drizzle-kit generate && drizzle-kit migrate`.
- Tests: `pnpm test` runs `vitest run`.

If you need to run server-only in development, inspect `server/_core/index.ts` — it will start an available port and mount `/api/trpc`.

## High-level architecture & data flow

- Client talks to server via tRPC at `/api/trpc`. Client constructs a typed tRPC client using `client/src/lib/trpc.ts` (it imports `AppRouter` from `server/routers`).
- Server exports a single `appRouter` in `server/routers.ts` that composes sub-routers (e.g., `auth`, `otp`, `loans`, `payments`, `legal`).
- Authentication: sessions are signed JWTs stored in a cookie (`shared/const.ts` -> `COOKIE_NAME`). The server authenticates requests in `server/_core/sdk.ts` (method `authenticateRequest`) and `server/_core/context.ts` injects `user` into tRPC context.
- Authorization helpers: `server/_core/trpc.ts` defines `publicProcedure`, `protectedProcedure` (requires auth), and `adminProcedure` (requires role === 'admin'). Use these when adding routes.
- Database: schema is in `drizzle/schema.ts` (Drizzle ORM). Use `server/db.ts` functions to interact with the DB; migrations live in `drizzle/migrations/`.

## Project-specific conventions and patterns

- tRPC transformer: superjson is used both server-side and client-side (`server/_core/trpc.ts` and `client/src/main.tsx`).
- Errors: the codebase uses specific shared error message constants for auth/permission states: `UNAUTHED_ERR_MSG` and `NOT_ADMIN_ERR_MSG` in `shared/const.ts`. When throwing TRPC errors, prefer these constants for consistent client-side handling.
- Cookie/session: cookie signing/verification and OAuth exchange are implemented in `server/_core/sdk.ts`. Environment vars expected: `JWT_SECRET` (cookieSecret), `OAUTH_SERVER_URL`, `VITE_APP_ID`, and `DATABASE_URL` (see `server/_core/env.ts`).
- Type sharing: the front-end imports `AppRouter` from `server/routers` (relative path). Keep router types stable when changing endpoints to avoid client build/type errors.
- Query & mutation caches: client uses React Query (`@tanstack/react-query`). Global unauthorized handling is implemented in `client/src/main.tsx` (redirect to login when a TRPCClientError message equals `UNAUTHED_ERR_MSG`). Follow that pattern when introducing new auth-related errors.

## Integration points & external dependencies

- OAuth: server integrates with an OAuth provider (configured via `OAUTH_SERVER_URL`) and maps/manages users in `server/_core/sdk.ts`.
- Payments: payment logic is split into modules under `server/_core/` (e.g., `authorizenet.ts`, `crypto-payment.ts`) and exposed under `payments` routes in `server/routers.ts`.
- Storage & S3: `@aws-sdk/client-s3` is available; storage integration appears under `server/storage.ts`.

## Key files to inspect when making changes

- `server/routers.ts` — main tRPC router composition and domain routers.
- `server/_core/trpc.ts` — procedure/middleware patterns (public/protected/admin).
- `server/_core/sdk.ts` — session, OAuth sync, and request authentication.
- `server/_core/index.ts` — server entry (dev vs prod, vite integration, body size limits).
- `client/src/main.tsx` — tRPC client setup, global error handling, and auth redirect logic.
- `drizzle/schema.ts` — canonical DB schema and types used across server.

## Small actionable rules for code edits

- When adding a tRPC route, export it from `server/routers.ts` and use `publicProcedure` / `protectedProcedure` / `adminProcedure` as appropriate.
- If the route returns complex data, ensure server and client use `superjson` (already wired) and add/adjust types in `drizzle/schema.ts` if DB-backed.
- For auth flow changes, update both `server/_core/sdk.ts` (server session handling) and `client/src/_core/hooks/useAuth.ts` (client-side expectations like `manus-runtime-user-info` localStorage key and redirect behavior).
- Database changes must include Drizzle migrations; use `pnpm run db:push` after updating `drizzle/schema.ts`.

## When to ask humans

- If you need missing environment values (OAuth server, JWT secret, DB URL) — don't guess; ask for values or vault credentials.
- If you propose changing the public tRPC API shape (router names/fields) — confirm with the team because the front-end imports `AppRouter` directly.

-- End of file --
