import { useRef, useState } from "react";
import { supabase } from "../services/supabase.js";

export default function AudioRecorder({ user }) {
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const stopTimeoutRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [status, setStatus] = useState("Idle");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [startedAt, setStartedAt] = useState(null);
  const [endedAt, setEndedAt] = useState(null);

  const startRecording = async () => {
    setError("");
    setStatus("Requesting microphone access...");
    try {
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
      setStartedAt(new Date());
      setIsRecording(true);
      setStatus("Recording (10s max)...");

      stopTimeoutRef.current = setTimeout(() => {
        stopRecording();
      }, 10000);
    } catch (err) {
      setError("Microphone access was denied.");
      setStatus("Idle");
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;
    recorder.stop();
    recorder.stream.getTracks().forEach((track) => track.stop());
    if (stopTimeoutRef.current) {
      clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }
    setEndedAt(new Date());
    setIsRecording(false);
  };

  const uploadRecording = async () => {
    if (!user) {
      setError("You must be signed in to upload.");
      return;
    }
    if (!chunksRef.current.length) {
      setError("No recording available.");
      return;
    }

    setIsUploading(true);
    setError("");

    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    const fileName = `${Date.now()}.webm`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("sleep-audio")
      .upload(filePath, blob, { contentType: "audio/webm" });

    if (uploadError) {
      setIsUploading(false);
      setError(uploadError.message);
      return;
    }

    const { error: insertError } = await supabase.from("sleep_sessions").insert({
      user_id: user.id,
      started_at: startedAt,
      ended_at: endedAt ?? new Date(),
      audio_path: filePath,
      audio_format: "webm"
    });

    if (insertError) {
      setIsUploading(false);
      setError(insertError.message);
      return;
    }

    setStatus("Uploaded to Supabase");
    setIsUploading(false);
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <h2 className="text-lg font-semibold">Audio Recorder</h2>
      <p className="text-sm text-slate-400">Capture a short sleep sample to analyze disturbances.</p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"
          onClick={startRecording}
          disabled={isRecording || isUploading}
        >
          Start
        </button>
        <button
          className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold"
          onClick={stopRecording}
          disabled={!isRecording || isUploading}
        >
          Stop
        </button>
        <button
          className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"
          onClick={uploadRecording}
          disabled={isRecording || isUploading}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
        <span className="text-xs text-slate-400">{status}</span>
      </div>

      {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}

      {audioUrl ? (
        <audio className="mt-4 w-full" controls src={audioUrl} />
      ) : (
        <p className="mt-4 text-xs text-slate-500">No recording yet.</p>
      )}
    </section>
  );
}
