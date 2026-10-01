# VulnTrack Frontend

React 19 and TypeScript single-page app for VulnTrack, built with Vite 8 and the `@vitejs/plugin-react` plugin. It talks to the Spring Boot API in `../backend`.

## Pages

| Route | Page | Notes |
|---|---|---|
| `/login` | `src/pages/Login.tsx` | Posts to `/api/auth/login` and keeps the returned JWT in React state |
| `/` | `src/pages/Dashboard.tsx` | Findings list with severity color-coding and severity/status filters |
| `/vulnerabilities/:id` | `src/pages/VulnerabilityDetail.tsx` | Detail view for one finding |

Both `/` and `/vulnerabilities/:id` are wrapped in `RequireAuth` (`src/auth.tsx`), which redirects to `/login` when there is no token. Routing uses `react-router-dom` 7.

## Configuration

`src/api.ts` reads the API base URL from `VITE_API_BASE`. Without it, the app calls `http://localhost:8081/api`.

## Scripts

```bash
npm ci            # install dependencies
npm run dev       # Vite dev server
npm run build     # type-check with tsc -b, then vite build into dist/
npm run lint      # oxlint
npm run preview   # serve the production build locally
```

## Container image

The `Dockerfile` builds the bundle on `node:24-alpine` with `VITE_API_BASE=/api`, then serves `dist/` from `nginx:1.29-alpine`. `nginx.conf.template` proxies `/api/` to `BACKEND_URL` (by default `http://vulntrack-backend.default.svc.cluster.local:8081`) and falls back to `index.html` for client-side routes.
