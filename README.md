# OfferLock.Ai

> Turn a job description and your experience into a focused interview strategy.

OfferLock.Ai is a full-stack AI interview preparation platform. It analyzes a target role alongside a candidate's resume and experience, then creates a personalized plan with technical questions, behavioral questions, skill gaps, match scoring, and a practical preparation roadmap.

## Why OfferLock.Ai?

Most interview preparation is generic. OfferLock.Ai is built around the specific opportunity a candidate is pursuing:

- **Role-aware preparation** based on the real job description
- **Profile-aware recommendations** from a resume or candidate summary
- **Actionable interview questions** with intent and suggested answers
- **Skill-gap analysis** to focus preparation time where it matters
- **Personalized preparation roadmap** organized into daily tasks
- **Generated resume PDF** tailored to the target role
- **Private user workspace** with saved interview plans

## Product Flow

```text
Create an account
      |
      v
Add a job description + upload a resume
      |
      v
AI analyzes the role and candidate profile
      |
      v
Review match score, questions, skill gaps, and roadmap
      |
      v
Download a tailored resume PDF
```

## Core Features

### Authentication

- User registration and login
- Cookie-based authentication
- Protected application routes
- Session lookup with `get-me`
- Logout with server-side token invalidation

### Interview Strategy Generation

The application sends the job description and candidate profile to Google Gemini and requests structured JSON. The response is validated with Zod before it is saved.

Each report can contain:

- Target role title
- Match score from 0 to 100
- Technical interview questions
- Behavioral interview questions
- What each question assesses
- Suggested answers
- Skill gaps with severity levels
- Day-by-day preparation tasks

### Resume PDF Generation

The backend can ask Gemini to generate a clean, ATS-friendly HTML resume. Puppeteer converts that HTML into a downloadable PDF.

## Tech Stack

### Frontend

- React 19
- React Router
- Vite
- Axios
- Oxlint
- CSS modules by feature/page

### Backend

- Node.js
- Express 5
- MongoDB with Mongoose
- JWT authentication with HTTP cookies
- Multer for in-memory resume uploads
- `pdf-parse` for PDF text extraction
- Google Gemini API for AI generation
- Zod for response validation
- Puppeteer for PDF creation

## Project Structure

```text
OfferLock.Ai/
├── backend/
│   ├── app.js                 # Express server entry point
│   ├── Auth/                  # Token helpers
│   ├── controllers/           # Auth and interview request handlers
│   ├── middlewares/           # Authentication and upload middleware
│   ├── models/                # Mongoose models
│   ├── routes/                # REST API routes
│   └── services/              # Gemini and PDF generation
│
├── frontend/
│   ├── src/
│   │   ├── features/auth/     # Login, registration, auth state
│   │   └── features/interview/# Home, reports, interview strategy UI
│   ├── public/
│   └── vite.config.js
│
└── README.md
```

## Requirements

Install these before starting:

- Node.js 20 or newer
- npm
- MongoDB database
- Google Gemini API key

Puppeteer may download a browser during installation. Make sure your environment allows that download and has the libraries required by Chromium when running on Linux.

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd OfferLock.Ai
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure backend environment variables

Create `backend/.env`:

```env
PORT=3000
FRONTEND_URL=http://localhost:5173
MONGO_URI=your_mongodb_connection_string
JWT_SECRETE=your_long_random_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

Never commit `.env`. Use `backend/.env.example` for a shareable template.

The frontend backend URL is configured in `frontend/src/config/api.config.js`:

```js
const API_BASE_URL = "http://localhost:3000";
```

Change this value to the deployed backend URL before deploying the frontend. Do not put secrets in frontend source code.

### 4. Start the backend

```bash
npm start
```

The API runs at `http://localhost:3000`.

### 5. Install and start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The Vite development server normally runs at `http://localhost:5173`.

## Deployment

### Vercel frontend

This repository contains the frontend in the `frontend/` directory. The root `vercel.json` is already configured to:

- Install frontend dependencies
- Build the Vite application
- Serve `frontend/dist`
- Support direct navigation to React routes such as `/login` and `/register`

In Vercel, import the GitHub repository and leave the project root as the repository root. Vercel should use the committed `vercel.json` automatically. Do not set the Vercel output directory to the repository root.

Update the backend URL in `frontend/src/config/api.config.js` before deploying the frontend:

```js
const API_BASE_URL = "https://your-backend-service.onrender.com";
```

### Render backend

Create a Web Service pointing to the `backend/` directory, or configure the service commands as:

```text
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

Set these environment variables in Render:

```env
PORT=10000
FRONTEND_URL=https://offer-lock-ai.vercel.app
MONGO_URI=your_mongodb_connection_string
JWT_SECRETE=your_long_random_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

After changing `api.config.js`, push to `main` so Vercel creates a new deployment.

## Available Commands

### Backend

```bash
cd backend
npm start
```

### Frontend

```bash
cd frontend
npm run dev       # Start Vite development server
npm run build     # Create production build
npm run lint      # Run Oxlint
npm run preview   # Preview production build locally
```

## API Reference

All protected interview endpoints require the authenticated cookie.

### Authentication

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Create a user account |
| `POST` | `/api/auth/login` | Log in and set auth cookie |
| `GET` | `/api/auth/logout` | Log out and clear auth cookie |
| `GET` | `/api/auth/get-me` | Get the current authenticated user |

### Interview Reports

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/interview` | Generate and save an interview report |
| `GET` | `/api/interview` | List the current user's reports |
| `GET` | `/api/interview/report/:interviewId` | Fetch one interview report |
| `POST` | `/api/interview/resume/pdf/:interviewReportId` | Generate a tailored resume PDF |

The report generation request uses multipart form data:

- `jobDescription`: target job description
- `selfDescription`: candidate summary
- `resume`: uploaded PDF resume

## Security Notes

Before deploying:

- Rotate any API keys or database credentials that have been exposed.
- Keep `.env` files out of Git.
- Use a strong random JWT secret.
- Configure CORS with the real frontend origin instead of localhost.
- Enforce report ownership on report detail and PDF endpoints.
- Add production error handling for upload and database failures.
- Use HTTPS so authentication cookies are protected in transit.
- Add rate limiting around authentication and AI generation endpoints.
- Set secure cookie options for the deployment environment.

## Current Limitations

- AI generation depends on Gemini availability and API quotas.
- Resume extraction currently depends on PDF input.
- Puppeteer must be able to launch Chromium in the deployment environment.

## Contributing

1. Create a feature branch.
2. Keep changes focused and explain behavior changes in the pull request.
3. Run frontend lint and build checks before opening a pull request.
4. Never commit secrets, generated builds, or local environment files.

