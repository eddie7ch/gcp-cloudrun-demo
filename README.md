# gcp-cloudrun-demo

A **shareable todo list app**: create a list, get a link, send it to anyone — no sign-up required. Built with Node.js/Express, a small vanilla-JS frontend, and SQLite for persistence, containerized and deployed to **Google Cloud Run**.

## How it works

- Visit `/`, click "Create a new list" and you're dropped onto a unique `/l/<id>` URL.
- Share that URL with anyone (friends, roommates, teammates) — whoever has the link can add, check off, and delete items.
- No accounts, no database setup on your end — it's just a link.

## Endpoints

- `GET /` — landing page (create a new list)
- `GET /l/:id` — the todo list UI for a given list
- `GET /api` — service info
- `GET /health` — health check
- `POST /api/lists` — create a new list, returns `{ id, url }`
- `GET /api/lists/:id/todos` — list todos
- `POST /api/lists/:id/todos` — add a todo (`{ "text": "..." }`)
- `PATCH /api/lists/:id/todos/:todoId` — toggle done
- `DELETE /api/lists/:id/todos/:todoId` — delete a todo

## Persistence note

Todos are stored in a local SQLite file (`data/todos.db`) using Node's built-in `node:sqlite` module (Node 22.5+, no native build step). This is great for a single always-on instance, but Cloud Run containers are ephemeral — data can be lost on redeploys, scale-to-zero, or when traffic is split across multiple instances. For durable multi-instance persistence, swap `lib/db.js` for a managed store like Firestore or Cloud SQL.

## Run locally

Requires Node.js 22.5+ (for the built-in `node:sqlite` module).

```powershell
npm install
npm start
```

## Deploy to Google Cloud Run

Prerequisites: a GCP project with billing enabled, and the [gcloud CLI](https://cloud.google.com/sdk/docs/install) installed and authenticated (`gcloud init`, `gcloud auth login`).

```powershell
# One-time: set your project
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# Build the container with Cloud Build and deploy to Cloud Run
gcloud run deploy gcp-cloudrun-demo `
  --source . `
  --region us-central1 `
  --allow-unauthenticated
```

`gcloud` will print a `*.run.app` URL when deployment finishes — that's your live GCP-hosted service.

## Tear down (avoid ongoing charges)

```powershell
gcloud run services delete gcp-cloudrun-demo --region us-central1
```
