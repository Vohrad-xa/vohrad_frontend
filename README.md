# Sykamore Frontend

Monorepo for **Sykamore**, an inventory management system.  
Current focus: **mobile app (Expo React Native)**. Next: **web admin dashboard
(Next.js)**.

## What’s inside

- **Mobile app**: `apps/mobile/` (Expo, Expo Router, TypeScript)
- **Web admin dashboard** (planned): `apps/web/` (Next.js App Router)
- **Shared packages**:
  - `packages/api-client/` – domain API clients (auth, tenant, items, roles,
    attachments, users, dashboard…)
  - `packages/store/` – Zustand store + TanStack Query hooks
  - `packages/types/` – shared TypeScript types + Zod schemas
  - `packages/auth/` – shared auth utilities

## Tech stack

- React Native (Expo) + Expo Router
- Next.js (App Router)
- TypeScript
- Zustand
- TanStack Query
- Zod
- pnpm workspaces

## Mobile feature areas

`apps/mobile/features/` includes:

- attachments
- auth
- dashboard
- item
- network
- roles
- security
- settings
- locations
- maintenance
- check in/out
- user management
- ...

This repo expects a backend API (not included here).

## Setup

```bash
pnpm install
```

## Development

```bash
# Mobile
pnpm start:mobile
pnpm start:android
pnpm start:ios

# Workspace
pnpm start
```

## Build

```bash
pnpm build
pnpm build:packages
```

### Mobile production builds (EAS)

```bash
pnpm --filter mobile run eas:build
```

## Quality

```bash
pnpm typecheck
pnpm lint
pnpm format
pnpm test
```

## Roadmap

- Mobile app: active development
- Web admin dashboard: planned next
- Expand shared packages (types, API clients, store)

## Screenshots

<p align="center">
  <img src="https://github.com/user-attachments/assets/302ef635-86f8-4363-8d67-7566e36c481d" width="24%" alt="Screenshot 1" />
  <img src="https://github.com/user-attachments/assets/47bff190-4ca2-4ba7-8521-c161b1a7bb34" width="24%" alt="Screenshot 6" />
  <img src="https://github.com/user-attachments/assets/846a3f4a-5324-4f56-aa72-57eda8e7a105" width="24%" alt="Screenshot 2" />
  <img src="https://github.com/user-attachments/assets/1bc7cd86-cde4-449e-9f89-10f6f57b42b0" width="24%" alt="Screenshot 3" />
</p>

<details>
  <summary>More screenshots</summary>

  <p align="center">
    <img src="https://github.com/user-attachments/assets/5b890c7b-fc5e-4b42-822f-102af43d30bb" width="24%" alt="Screenshot 4" />
    <img src="https://github.com/user-attachments/assets/7d374a6f-ee58-4fd2-a1c6-5d1ba33ff6e1" width="24%" alt="Screenshot 5" />
    <img src="https://github.com/user-attachments/assets/de984f49-91d4-42c2-9b0a-0f1da030c961" width="24%" alt="Screenshot 7" />
    <img src="https://github.com/user-attachments/assets/060251b3-9580-4090-9d2c-73f8ef3028f0" width="24%" alt="Screenshot 8" />
  </p>
</details>
