import tempfile
import urllib.request
import numpy as np
import librosa
import audioread


def download_audio_bytes(url: str) -> bytes:
    with urllib.request.urlopen(url, timeout=30) as response:
        return response.read()


def decode_duration_seconds(audio_bytes: bytes, suffix: str = ".webm") -> float:
    # Librosa works more reliably when decoding from a real temp file.
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=True) as tmp_file:
        tmp_file.write(audio_bytes)
        tmp_file.flush()
        try:
            waveform, sample_rate = librosa.load(tmp_file.name, sr=None, mono=True)
        except audioread.exceptions.NoBackendError as exc:
            raise RuntimeError(
                "Audio decode backend unavailable. Install ffmpeg for webm decoding."
            ) from exc
    return float(len(waveform) / sample_rate)


def analyze_audio(audio_bytes: bytes):
    """
    Minimal stub: loads audio, extracts basic features, returns a simple score.
    """
    with io.BytesIO(audio_bytes) as buffer:
        y, sr = librosa.load(buffer, sr=None, mono=True)

    duration_sec = float(len(y) / sr)
    rms = librosa.feature.rms(y=y).flatten()
    rms_mean = float(np.mean(rms))
    rms_max = float(np.max(rms))

    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    mfcc_mean = float(np.mean(mfcc))

    # Simple heuristic score (0-100). Replace with real model later.
    score = 100 - min(100, int(rms_mean * 1000))

    return {
        "duration_sec": duration_sec,
        "rms_mean": rms_mean,
        "rms_max": rms_max,
        "mfcc_mean": mfcc_mean,
        "sleep_quality_score": score,
    }
