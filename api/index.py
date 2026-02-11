from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from .audio_processor import analyze_audio
from .mcp_agent import summarize_sleep

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
async def analyze(file: UploadFile = File(...)):
    payload = await file.read()
    analysis = analyze_audio(payload)
    return {"analysis": analysis}


@app.post("/assistant")
async def assistant(summary: dict):
    response = summarize_sleep(summary)
    return {"response": response}
