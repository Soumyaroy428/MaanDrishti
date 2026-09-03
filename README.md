# MaanDrishti

Basic separated client and server applications.

## Structure

- `client/` - Next.js TypeScript frontend application
- `server/` - Express TypeScript backend API (`app.ts` and `server.ts`)
  - `database/` - database connection module

## Install

```bash
npm install
npm run install:all
```

## Run separately

In one terminal:

```bash
npm run dev:server
```

In another terminal:

```bash
npm run dev:client
```

Or run both together:

```bash
npm run dev
```

This starts both services. Open `http://localhost:3000` in your browser.

The frontend runs at `http://localhost:3000` and the backend runs at
`http://localhost:5000`.

## API

- `GET /api/health` - health check
- `GET /api/message` - sample API response
