import { useRef, useState } from "react";

export default function AudioRecorder() {
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [status, setStatus] = useState("Idle");

  const startRecording = async () => {
    setStatus("Requesting microphone access...");
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setStatus("Recording complete");
    };

    mediaRecorder.start();
    setIsRecording(true);
    setStatus("Recording...");
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;
    recorder.stop();
    recorder.stream.getTracks().forEach((track) => track.stop());
    setIsRecording(false);
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <h2 className="text-lg font-semibold">Audio Recorder</h2>
      <p className="text-sm text-slate-400">Capture a short sleep sample to analyze disturbances.</p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"
          onClick={startRecording}
          disabled={isRecording}
        >
          Start
        </button>
        <button
          className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold"
          onClick={stopRecording}
          disabled={!isRecording}
        >
          Stop
        </button>
        <span className="text-xs text-slate-400">{status}</span>
      </div>

      {audioUrl ? (
        <audio className="mt-4 w-full" controls src={audioUrl} />
      ) : (
        <p className="mt-4 text-xs text-slate-500">No recording yet.</p>
      )}
    </section>
  );
}
