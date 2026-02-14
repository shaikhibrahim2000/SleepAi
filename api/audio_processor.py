import tempfile
import urllib.request
import numpy as np
import librosa
import audioread


def download_audio_bytes(url: str) -> bytes:
    with urllib.request.urlopen(url, timeout=30) as response:
        return response.read()


def decode_audio_bytes(audio_bytes: bytes, suffix: str = ".webm") -> tuple[np.ndarray, int]:
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
    return waveform, sample_rate


def extract_features(waveform: np.ndarray, sample_rate: int) -> dict:
    duration_sec = float(len(waveform) / sample_rate)

    rms = librosa.feature.rms(y=waveform).flatten()
    rms_mean = float(np.mean(rms))
    rms_max = float(np.max(rms))

    centroid = librosa.feature.spectral_centroid(y=waveform, sr=sample_rate).flatten()
    spectral_centroid_mean = float(np.mean(centroid))
    spectral_centroid_max = float(np.max(centroid))

    return {
        "duration_sec": duration_sec,
        "rms_mean": rms_mean,
        "rms_max": rms_max,
        "spectral_centroid_mean": spectral_centroid_mean,
        "spectral_centroid_max": spectral_centroid_max,
    }
