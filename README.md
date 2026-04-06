# Reef

Reef is a full-stack monorepo:

- `client/` - Vite + React single-page app (deploy to GitHub Pages)
- `server/` - Express + Mongoose API (deploy separately, e.g. Railway)

## Stack

- Frontend: React (Vite), JavaScript, CSS Modules
- Backend: Node.js + Express, JavaScript
- Database: MongoDB Atlas via Mongoose
- Drawing: `react-sketch-canvas`
- Grid snapshot: `html2canvas`
- World ID login: `@worldcoin/idkit`

## 2-Minute Team Quickstart

1. Clone repo and install dependencies.
2. Copy env templates and fill real values.
3. Run backend, then frontend.
4. Verify health endpoint and open app.

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and credentials

cd ../client
npm install
cp .env.example .env.local
# Edit .env.local with your API URL and World ID credentials
```

```bash
cd server
npm run dev
```

```bash
cd client
npm run dev
```

```bash
curl http://localhost:4000/health
```

Expected health response:

```json
{ "ok": true }
```

Open the app at:

```text
http://localhost:5173
```

## Troubleshooting

- **Backend says `node server.js` but no localhost response**
  - Confirm `server/.env` exists and has `MONGODB_URI` + `PORT`.
  - Check Atlas Network Access allows your IP.
  - Check Atlas user/password are valid.
  - Run `curl http://localhost:4000/health`.

- **Frontend loads but cannot fetch cells**
  - Confirm `client/.env.local` has `VITE_API_URL=http://localhost:4000`.
  - Confirm backend is running and `/api/cells` returns JSON.
  - Check CORS `ALLOWED_ORIGIN` for deployed frontend origin.

- **World ID button appears but verification fails**
  - Confirm `VITE_WLD_APP_ID` and `VITE_WLD_ACTION` match registered app/action.
  - Ensure app/action are configured in `developer.worldcoin.org`.

## Repository Structure

- `client/src/components/Grid.jsx`
- `client/src/components/Cell.jsx`
- `client/src/components/LoginPopup.jsx`
- `client/src/components/DrawPopup.jsx`
- `client/src/components/ConfirmPopup.jsx`
- `client/src/components/AlreadySubmittedPopup.jsx`
- `client/src/components/DownloadButton.jsx`
- `client/src/hooks/useGrid.js`
- `client/src/hooks/useSession.js`
- `client/src/api/client.js`
- `client/src/App.jsx`
- `client/src/App.module.css`
- `client/src/main.jsx`
- `server/routes/cells.js`
- `server/models/Cell.js`
- `server/server.js`

## Environment Variables

See [`.env.example` files](./client/.env.example) for complete documentation.

### Quick Reference

**Client** (`client/.env.local`):
- `VITE_API_URL` - Backend API URL
- `VITE_WLD_APP_ID` - World ID app ID (get from developer.worldcoin.org)
- `VITE_WLD_ACTION` - World ID action ID

**Server** (`server/.env`):
- `MONGODB_URI` - MongoDB Atlas connection string
- `PORT` - Server port (default 4000)
- `WLD_APP_ID` - World ID app ID
- `WLD_ACTION` - World ID action ID  
- `ALLOWED_ORIGIN` - Frontend domain for CORS (set in production)

**⚠️ IMPORTANT**: Never commit `.env` or `.env.local` files. See [SECURITY.md](./SECURITY.md) for credential rotation procedures.

## Install and Run

Install dependencies:

```bash
cd client
npm install
cd ../server
npm install
```

Run backend (port `4000` by default):

```bash
cd server
npm run dev
```

Run frontend (Vite dev server on `5173`):

```bash
cd client
npm run dev
```

Build frontend:

```bash
cd client
npm run build
```

Start backend in production mode:

```bash
cd server
npm start
```

## API Contract

### `GET /api/cells`

Returns an array of submitted cells:

```json
[
  {
    "gridIndex": 0,
    "imageData": "data:image/png;base64,...",
    "createdAt": "..."
  }
]
```

`nullifierHash` is intentionally not returned.

### `POST /api/cells`

Request body:

```json
{ "nullifierHash": "...", "imageData": "data:image/png;base64,..." }
```

Responses:

- `201` with `{ "gridIndex": number, "imageData": string }`
- `409` with `{ "error": "already_submitted" }` if nullifier already exists

## Team Development Guide

### Branching and PR workflow

1. Create short-lived feature branches from `main`.
2. Keep each PR focused on one concern (frontend UI, backend API, infra, docs).
3. Link PRs to tasks/issues and include screenshots for UI changes.
4. Require at least one teammate review before merge.

### Local development conventions

1. Use Node 18+ across all machines.
2. Keep secrets only in local env files; never commit real credentials.
3. Treat frontend and backend as independently deployable services.
4. Keep API route changes reflected in both `server/routes/cells.js` and `client/src/api/client.js`.

### Handoff checklist before merging

1. Frontend starts with `npm run dev` and renders grid/popups.
2. Backend starts with `npm run dev` and serves `GET /api/cells`.
3. `POST /api/cells` returns `201` for new nullifier and `409` for duplicate.
4. Download button exports `proof-of-attrition.png`.
5. README/env instructions are updated if behavior or variables changed.

### Deployment notes

- Deploy `client/` to GitHub Pages (or equivalent static host).
- Deploy `server/` to Railway/Render/Fly with env vars set.
- Set `ALLOWED_ORIGIN` to your frontend production origin.
- Register your World App ID and action at `developer.worldcoin.org`.

## Important Note on World ID

You must create and configure your World App ID and action in the Worldcoin developer portal:

- https://developer.worldcoin.org

The values in `.env` are placeholders for local scaffolding.
