# AGENTS Guide - Proof of Attrition

## What this repo is
- Monorepo with two deployable services: `client/` (Vite + React SPA) and `server/` (Express + Mongo API).
- Core product loop: a user picks an empty grid cell, verifies identity (or guest fallback), draws, confirms, and persists one permanent submission.
- Global uniqueness is enforced on backend by `nullifierHash` and `gridIndex` unique constraints in `server/models/Cell.js`.

## Architecture and data flow
- Frontend state orchestration is centralized in `client/src/App.jsx`; popups are controlled by `activePopup` (`login` -> `draw` -> `confirm`).
- Grid data lifecycle lives in `client/src/hooks/useGrid.js`: initial fetch (`fetchCells`), derived dimensions (`computeGridDimensions`), zoom controls, and local append via `addCell`.
- Session/identity lifecycle lives in `client/src/hooks/useSession.js`; `setVerifiedNullifier` preserves `hasSubmitted` only for the same nullifier.
- API calls are funneled through `client/src/api/client.js` (`fetchCells`, `createCell`), with error normalization (`Error.message` = backend `error`, plus `error.status`).
- Server entrypoint `server/server.js` wires CORS, JSON body limit (`15mb`), health check (`/health`), and mounts `server/routes/cells.js`.
- `POST /api/cells` in `server/routes/cells.js` validates payload, checks duplicate nullifier, checks occupied index, then writes.
- Conflict taxonomy is meaningful and consumed by client: `already_submitted` and `cell_taken` are both `409`; `invalid_payload` is `400`.

## High-value workflows
- Install once per service: `npm install` in `client/` and `server/`.
- Local env setup uses templates: copy `client/.env.example` -> `client/.env.local`, and `server/.env.example` -> `server/.env`.
- Run backend first (`server`: `npm run dev`), then frontend (`client`: `npm run dev`); frontend expects API at `VITE_API_URL`.
- Smoke-check backend with `GET /health` and `GET /api/cells` before debugging UI flows.
- There are currently no test scripts in either `package.json`; validation is manual via the app flow and API responses.

## Project-specific conventions
- Keep frontend/backend contract changes synchronized in both `server/routes/cells.js` and `client/src/api/client.js` (explicitly called out in `README.md`).
- Server is CommonJS (`require/module.exports`); client is ESM (`import/export`). Keep style consistent per side.
- `GET /api/cells` intentionally omits `nullifierHash`; do not expose it unless product requirements change.
- Grid UI disables filled cells (`client/src/components/Cell.jsx`) and derives occupancy from `gridIndex` map in `client/src/components/Grid.jsx`.
- Download snapshot behavior depends on temporarily resetting transform scale in `client/src/components/DownloadButton.jsx`; preserve this when changing zoom/grid rendering.

## Integration points and external deps
- World ID widget integration is root-mounted in `client/src/App.jsx` (`IDKitWidget`) and opened programmatically via `useIDKit` to avoid modal layering issues.
- Required client env vars: `VITE_API_URL`, `VITE_WLD_APP_ID`, `VITE_WLD_ACTION`.
- Required server env vars: `MONGODB_URI`, `PORT`, `ALLOWED_ORIGIN` (plus placeholders `WLD_APP_ID`, `WLD_ACTION`).
- CORS allowlist always includes `http://localhost:5173`; production origin is appended from `ALLOWED_ORIGIN` in `server/server.js`.
- Drawing and export rely on `react-sketch-canvas` (`DrawPopup.jsx`) and `html2canvas` (`DownloadButton.jsx`); changes here can affect submission image fidelity.

