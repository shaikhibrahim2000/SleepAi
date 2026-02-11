# Sleep Sound Analysis

AI-powered sleep sound analysis web application.

## Structure
- `api/`: FastAPI serverless functions for analysis + assistant.
- `client/`: React (Vite) frontend with Tailwind UI.

## Local setup
1. Install frontend deps:
   - `cd client && npm install`
2. Run frontend:
   - `npm run dev`
3. API (optional local):
   - `cd api && python -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt`
   - `uvicorn index:app --reload`

## Environment variables
Frontend expects:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Backend expects:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Notes
- `api/mcp_agent.py` is a placeholder until MCP is wired in.
- `api/audio_processor.py` contains a minimal Librosa pipeline.
