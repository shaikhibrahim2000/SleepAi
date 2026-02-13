import os

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from supabase import Client, create_client

try:
    from .mcp_agent import summarize_sleep
except ImportError:
    from mcp_agent import summarize_sleep


class AnalyzeRequest(BaseModel):
    sleep_session_id: str
    audio_path: str


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SLEEP_AUDIO_BUCKET = "sleep-audio"


def get_supabase_client() -> Client:
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(
            status_code=500,
            detail="Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
        )
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


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
    client = get_supabase_client()
    object_path = normalize_audio_path(payload.audio_path)
    signed = client.storage.from_(SLEEP_AUDIO_BUCKET).create_signed_url(
        object_path, 60
    )

    signed_url = signed.get("signedURL")
    if not signed_url:
        raise HTTPException(
            status_code=400,
            detail="Failed to create signed URL. Check bucket/path and policies.",
        )

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
