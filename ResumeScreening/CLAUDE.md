# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Agent chat application with a Python FastAPI backend (OpenAI GPT integration) and a vanilla JS/HTML/CSS frontend.

## Development Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # then add OPENAI_API_KEY
python main.py        # starts on http://localhost:8000
```

### Frontend

```bash
cd frontend
python -m http.server 3000  # visit http://localhost:3000
# or open index.html directly in a browser
```

No build step, linter, or test framework is configured.

## Architecture

### Request Flow

```
Browser (frontend/script.js)
  → POST /chat {message, system_prompt}
  → FastAPI (backend/main.py)
  → GPTAgent.chat() (backend/agents/gpt_agent.py)
  → OpenAI API (gpt-3.5-turbo, full conversation history sent each call)
  → response returned as JSON to frontend
```

### Backend Components

- **`main.py`** — FastAPI app; defines Pydantic request/response models and four routes: `GET /health`, `POST /chat`, `POST /reset`, `GET /history`. A single `GPTAgent` instance is shared for the lifetime of the process (in-memory state).
- **`agents/gpt_agent.py`** — Wraps the OpenAI client. Maintains `conversation_history` as a list of `{role, content}` dicts. `chat()` appends user message, calls the API with the full history, appends the assistant reply.
- **`config/settings.py`** — `pydantic_settings.BaseSettings` loaded from `backend/.env`. Key fields: `openai_api_key`, `host`, `port`, `debug`, `cors_origins`.

### Frontend Components

- **`script.js`** — Async event-driven; hardcodes `API_BASE_URL = 'http://localhost:8000'`. Tracks `isLoading` and `systemPromptSet` state. The system prompt is sent on every `/chat` request but only applied server-side on first message in a session.
- **`index.html` / `styles.css`** — Single-page chat UI; no framework dependencies.

### Key Constraints

- Conversation history is stored **in-memory** in the `GPTAgent` instance — restarting the server resets it.
- CORS origins are configured in `backend/.env` via `CORS_ORIGINS`. If the frontend runs on a port other than 3000, update this value.
- The frontend's `API_BASE_URL` is hardcoded in `script.js` — change it there if the backend moves.
