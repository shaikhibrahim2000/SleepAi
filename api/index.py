import os
from pathlib import Path

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from supabase import Client, create_client

try:
    from .mcp_agent import summarize_sleep
except ImportError:
    from mcp_agent import summarize_sleep


class AnalyzeRequest(BaseModel):
    sleep_session_id: str
    audio_path: str


SLEEP_AUDIO_BUCKET = "sleep-audio"
API_DIR = Path(__file__).resolve().parent

# Load backend secrets from api/.env for local development.
load_dotenv(API_DIR / ".env")


def get_supabase_client() -> Client:
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not supabase_service_role_key:
        raise HTTPException(
            status_code=500,
            detail="Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
        )
    return create_client(supabase_url, supabase_service_role_key)


def normalize_audio_path(path: str) -> str:
    cleaned = path.strip().lstrip("/")
    bucket_prefix = f"{SLEEP_AUDIO_BUCKET}/"
    if cleaned.startswith(bucket_prefix):
        return cleaned[len(bucket_prefix) :]
    return cleaned


app = FastAPI(title="Sleep Sound Analysis API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/analyze")
async def analyze(payload: AnalyzeRequest):
    # Phase 3.1: create a signed URL for private bucket audio.
    try:
        client = get_supabase_client()
        object_path = normalize_audio_path(payload.audio_path)
        signed = client.storage.from_(SLEEP_AUDIO_BUCKET).create_signed_url(
            object_path, 60
        )
        signed_url = signed.get("signedURL") if isinstance(signed, dict) else None
        if not signed_url:
            raise HTTPException(
                status_code=400,
                detail="Failed to create signed URL. Check bucket/path and policies.",
            )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Analyze failed: {exc}") from exc

    return {
        "sleep_session_id": payload.sleep_session_id,
        "audio_path": object_path,
        "signed_url": signed_url,
        "message": "Storage access verified. Audio fetch + signal processing comes next.",
    }


@app.post("/assistant")
async def assistant(summary: dict):
    response = summarize_sleep(summary)
    return {"response": response}
