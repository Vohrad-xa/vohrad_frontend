# Vohrad Frontend

Frontend applications for Vohrad inventory management system.

## Overview

This is a Turborepo monorepo containing the frontend applications for Vohrad:

- **Web App** - Admin dashboard
- **Mobile App** - Mobile application for inventory operations

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

```bash
# Start web app development server
pnpm turbo dev

# Start mobile app development server
pnpm turbo start

# Run both apps
pnpm turbo dev start
```

## Apps

### Web App (`apps/web/`)

- Next.js 15 with App Router
- TypeScript & Tailwind CSS
- Admin dashboard interface
- Available at: http://localhost:3000

### Mobile App (`apps/mobile/`)

- Expo React Native
- TypeScript with Expo Router
- Cross-platform inventory management
- Start with: `pnpm --filter mobile start`

## Commands

```bash
# Development
pnpm turbo dev        # Web development server
pnpm turbo start      # Mobile development server

# Build
pnpm build            # Build all apps

# Quality
pnpm lint             # Run linting
pnpm format           # Format code
pnpm test             # Run tests
```

## Architecture

- **Shared State**: Zustand store in `packages/store/`
- **Build System**: Turbo for task orchestration
- **Package Manager**: pnpm with workspaces
- **Styling**: Tailwind CSS (web) + React Native styling (mobile)
