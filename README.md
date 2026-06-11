# Turborepo Next Nest

A monorepo setup using Turborepo with Next.js frontend and NestJS backend.

## Project Structure

```
turborepo-next-nest/
├── apps/
│   ├── frontend/     # Next.js app with TypeScript and Tailwind CSS
│   └── backend/      # NestJS app with TypeScript and MongoDB
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── .env
```

## Prerequisites

- Node.js >= 18
- pnpm >= 8.15.0

## Installation

1. Install pnpm globally (if not already installed):

```bash
npm install -g pnpm
```

2. Install dependencies:

```bash
pnpm install
```

3. manually create `.env` with the MongoDB connection string in the root directory.

## Development

Run both frontend and backend in development mode with hot reload:

```bash
pnpm dev
```

This will start:

- **Frontend**: http://localhost:3000 (Next.js with hot reload)
- **Backend**: http://localhost:3001 (NestJS with watch mode)

Both applications will automatically reload when you make changes to the code.

## Available Scripts

- `pnpm dev` - Run both frontend and backend in development mode
- `pnpm build` - Build both applications
- `pnpm start` - Start both applications in production mode
- `pnpm lint` - Lint both applications

## Environment Variables

The MongoDB connection string is stored in the `.env` file at the root of the project. Make sure to keep this file secure and never commit it to version control (it's already in `.gitignore`).

## Technology Stack

### Frontend

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS

### Backend

- NestJS
- TypeScript
- MongoDB (via Mongoose)

### Monorepo

- Turborepo
- pnpm workspaces
