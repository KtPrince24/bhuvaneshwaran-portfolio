# Deployment Guide — Portfolio (Vercel Frontend + Render Backend)

This file documents the production deployment configuration for the existing portfolio. It does not claim that deployment or email delivery has been completed; those steps must be performed in the hosting dashboards.

## Project facts identified from repository

- Frontend framework: React (Create React App, customized with CRACO)
- Frontend package manager: Yarn 1.22 (`frontend/package-lock` is managed by Yarn 1.22; use `yarn`)
- Frontend dev command: `yarn start`
- Frontend production build command: `yarn build`
- Frontend production output directory: `frontend/build`
- Backend runtime: Python 3.11+
- Backend framework: FastAPI
- Backend entry point: `backend/server.py`, application object `app`
- Backend requirements file: `backend/requirements.txt`
- Backend local run command: `uvicorn server:app --host 0.0.0.0 --port 8001`
- Backend production start command: `uvicorn server:app --host 0.0.0.0 --port $PORT`

## Public assets verified in production build

- Profile photo: `/images/profile.png` -> `frontend/public/images/profile.png`
- Favicon: `/images/favicon.png` -> `frontend/public/images/favicon.png`
- Resume PDF (optional but currently present): `/resume.pdf` -> `frontend/public/resume.pdf`
- All other assets are copied from `frontend/public/` into `frontend/build/` during `yarn build`.

## Vercel frontend configuration

- Root Directory: `frontend`
- Framework Preset: Create React App
- Install Command: `yarn install`
- Build Command: `yarn build`
- Output Directory: `build`
- Node version: 18 or newer (recommended 20 LTS)

Required Vercel environment variable:

- `REACT_APP_BACKEND_URL=https://YOUR-RENDER-SERVICE.onrender.com`

Do not include a trailing slash in this value. The frontend constructs API requests as `${REACT_APP_BACKEND_URL}/api/contact`.

The backend URL is supplied through an environment variable. The frontend falls back to `http://localhost:8001` only for local development.

## Render backend configuration

- Root Directory: `backend`
- Runtime: Python
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
- Health Check Path: `/api/health`

Required Render environment variables:

- `MONGO_URL` (optional; needed so `/api/status` and database health checks can succeed. Use a MongoDB Atlas connection string in production if status checks are needed.)
- `DB_NAME=portfolio`
- `CORS_ORIGINS=https://YOUR-VERCEL-APP.vercel.app`
- `RESEND_API_KEY=<your Resend API key>`
- `EMAIL_FROM=<verified sender address in Resend>`
- `CONTACT_RECIPIENT_EMAIL=<recipient email address>`
- `EMAIL_REPLY_TO` (optional)

Set `CORS_ORIGINS` to the exact production frontend origin. Do not use `*` in production. If you use a custom domain, replace the origin accordingly, for example:

- `CORS_ORIGINS=https://www.example.com,https://example.com`

Also update the same Vercel `REACT_APP_BACKEND_URL` if a custom backend domain is used.

## Backend behavior notes

- The backend binds to `0.0.0.0` and uses Render's assigned `$PORT`.
- MongoDB is optional for contact form operation; the backend starts even if MongoDB is unavailable, but database-backed status endpoints return 503.
- Contact email delivery requires Resend configuration. Without it, `/api/health` reports email as unconfigured and `/api/contact` returns 503.
- Email secrets are read only from backend environment variables and are not exposed in frontend code.

## GitHub / security checklist

- `.env` files are ignored by `.gitignore` (`frontend/.env`, `backend/.env`, `.env`, and `*.env.local`).
- `node_modules/`, `frontend/build/`, virtual environments, and caches are ignored.
- Commit `.env.example` files only. Do not commit real API keys or credentials.
- Rotate any Resend API key that has been shared, committed, or exposed before production use.

## Remaining manual steps

1. Push the project to GitHub without `.env` files.
2. Create a Vercel project from the repository and set Root Directory to `frontend`.
3. Add `REACT_APP_BACKEND_URL` in Vercel with the Render backend URL.
4. Create a Render Web Service from the repository and set Root Directory to `backend`.
5. Add all backend environment variables in Render, using the exact Vercel origin in `CORS_ORIGINS`.
6. Deploy the backend first, then deploy the frontend.
7. Verify `/api/health` on Render and submit a test contact form.
8. Do not mark email delivery as working until a real successful test submission is confirmed.
9. If the old favicon is still visible, hard-refresh the browser (`Ctrl+F5` / `Cmd+Shift+R`) or clear cached site data.