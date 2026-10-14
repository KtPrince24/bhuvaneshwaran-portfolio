# K. Bhuvaneshwaran — Software Developer Portfolio

Full-stack personal portfolio built with React and FastAPI.

## Project structure

```
portfolio/
  frontend/        # React application
  backend/         # FastAPI application
  README.md
```

## Prerequisites

- Node.js 18 or newer
- Yarn 1.22 or newer
- Python 3.11 or newer
- MongoDB Community Server (optional for status endpoints)
- A Resend account (optional for contact email delivery)

## Install frontend dependencies

```bash
cd frontend
yarn install
```

## Create a Python virtual environment and install backend requirements

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

On this Ubuntu system, `python3.12` is also available and fully supported.

## Configure local environment variables

Frontend:

```bash
cd frontend
cp .env.example .env
```

Make sure `frontend/.env` contains:

```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

Backend:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your local MongoDB URL, allowed frontend origins, and Resend settings:

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=portfolio
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
RESEND_API_KEY=
CONTACT_RECIPIENT_EMAIL=
EMAIL_FROM=
EMAIL_REPLY_TO=
```

Frontend variables must never contain private API keys. Only `REACT_APP_BACKEND_URL` is public.

## Start the backend

```bash
cd backend
source .venv/bin/activate
uvicorn server:app --host 127.0.0.1 --port 8001 --reload
```

Health endpoint:

```bash
curl http://localhost:8001/api/health
```

## Start the frontend

In another terminal:

```bash
cd frontend
yarn start
```

The portfolio opens at `http://localhost:3000`.

## Add your personal photo

Place the photograph at:

```
frontend/public/images/profile.jpg
```

Supported formats: JPG, PNG, and WebP. If you use another filename or format, update `photo` in `frontend/src/data/profile.js`.

The hero section uses a professional portrait crop with `object-fit: cover`. If the file is missing, a neutral fallback with initials is shown instead of a broken image icon.

## Add your resume PDF

Place the resume at:

```
frontend/public/resume.pdf
```

If your supplied file is named `frontend/public/Bhuvaneshwaran_Resume.pdf` (or `Bhuvaneshwaran_resume.pdf`), copy or rename it to `frontend/public/resume.pdf`. Do not convert an HTML page or generated placeholder into a PDF; use the real resume PDF only.

The navbar and footer resume actions (labeled "Resume" and "Download resume") point to `/resume.pdf` and download it as `K_Bhuvaneshwaran_Resume.pdf`. They appear automatically only when the PDF is available. Keep `resumePath` in `frontend/src/data/profile.js` as `/resume.pdf`.

During development, if the PDF is missing, the resume actions stay disabled and a warning is printed to the browser console instead of opening a broken `/resume.pdf` URL.

No fabricated resume is included. Do not store private credentials in the public folder.

## Configure MongoDB

The backend starts without MongoDB. Status-check features require MongoDB. To enable them:

1. Install and start MongoDB.
2. Set `MONGO_URL` and `DB_NAME` in `backend/.env`.
3. Restart the backend.

## Configure Resend

1. Create a Resend account and verify a sender domain or sender address.
2. Create an API key.
3. Set these values in `backend/.env`:
   - `RESEND_API_KEY`
   - `CONTACT_RECIPIENT_EMAIL`
   - `EMAIL_FROM`
   - `EMAIL_REPLY_TO` (optional)

`EMAIL_FROM` must use a sender address permitted by your verified Resend domain. If Resend is not configured, the backend starts normally and the contact endpoint returns a clear configuration error without exposing secrets. The `Reply-To` header uses the visitor's validated email address.

## Personalize content

Edit `frontend/src/data/profile.js` for name, title, company, email, LinkedIn, GitHub, summary, education, skills, experience, and capabilities.

Edit `frontend/src/data/projects.js` for project descriptions and links. Only keep verified public links.

## Build the frontend for production

```bash
cd frontend
yarn build
```

The output is in `frontend/build/`.

## Deploy the frontend and backend

- Deploy the contents of `frontend/build/` to a static host for the frontend.
- Deploy the FastAPI backend with Uvicorn or a production ASGI server such as Gunicorn with Uvicorn workers.
- Set production environment variables on the hosting platform.
- Point `REACT_APP_BACKEND_URL` to the production backend URL before building the frontend.
- Configure `CORS_ORIGINS` to the production frontend origin rather than the wildcard.

## Troubleshooting

- **CRACO config not found:** ensure `frontend/craco.config.js` exists.
- **`onAfterSetupMiddleware` error:** use a webpack-dev-server 4.x version compatible with Create React App 5, then reinstall dependencies.
- **Frontend cannot reach backend:** check `REACT_APP_BACKEND_URL` and restart `yarn start`.
- **Contact form returns 503:** Resend environment variables are missing or invalid.
- **No resume link:** place `resume.pdf` in `frontend/public/` and reload.
- **Broken photo:** ensure the image path in `frontend/src/data/profile.js` points to an existing file under `frontend/public/`.
- **MongoDB unavailable:** status endpoints return 503; the portfolio UI still loads.
- **Port already in use:** stop the process using the port or change the documented port consistently.

## Security notes

The old Emergent email credential found in the supplied archive must be treated as compromised. Rotate or revoke it in the Emergent/integration dashboard, remove it from any tracked Git history, and do not reuse it. Use `backend/.env.example` for safe example values only.
