import io
import numpy as np
import librosa


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
