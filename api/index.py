from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

#from .mcp_agent import summarize_sleep


class AnalyzeRequest(BaseModel):
    sleep_session_id: str
    audio_path: str

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
    # Phase 3.0: smoke test endpoint
    return {
        "received": payload.model_dump(),
        "message": "Analyze endpoint is live. Storage fetch + analysis comes next.",
    }


@app.post("/assistant")
async def assistant(summary: dict):
    response = summarize_sleep(summary)
    return {"response": response}
