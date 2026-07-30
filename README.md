# gcp-cloudrun-demo

A minimal Node.js/Express REST API, containerized and deployed to **Google Cloud Run** — built to demonstrate hands-on GCP hosting experience.

## Endpoints

- `GET /` — service info
- `GET /healthz` — health check
- `GET /todos` — list todos (in-memory)
- `POST /todos` — create a todo (`{ "text": "..." }`)

## Run locally

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
