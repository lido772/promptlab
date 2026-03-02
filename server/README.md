# PromptLab server

Minimal Node/Express server to provide a secure server-side endpoint for prompt improvement.

Setup

1. Install dependencies:

```bash
cd server
npm install
```

2. Configure environment variables (create a `.env` or set in your deployment):

- `GEMINI_API_KEY` — your Gemini API key (optional; if omitted the server returns a local improvement)
- `GEMINI_API_URL` — the Gemini endpoint that accepts improve requests (optional)
- `PORT` — server port (default 3000)

3. Start:

```bash
npm start
```

Endpoints

- `POST /api/improve` — body: `{ prompt, model, modality }` returns `{ improvedPrompt, source }`.

Notes

- The server contains a local fallback `localImprove()` used when no Gemini key/url is configured. Replace the forwarding logic with your exact Gemini API call shape when ready.
