import { useEffect, useState } from "react";
import { supabase } from "../services/supabase.js";

export default function UploadsList({ user }) {
  const [sessions, setSessions] = useState([]);
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    let ignore = false;

    const loadSessions = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("sleep_sessions")
        .select("id, created_at, started_at, ended_at, audio_path, audio_format")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (ignore) return;

      if (error) {
        setStatus(error.message);
        return;
      }

      setSessions(data ?? []);
      setStatus(data?.length ? "" : "No uploads yet.");
    };

    loadSessions();

    return () => {
      ignore = true;
    };
  }, [user]);

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">My Uploads</h2>
        <span className="text-xs text-slate-400">Latest 10</span>
      </div>

      {sessions.length ? (
        <div className="mt-4 space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-slate-200">{session.audio_path}</p>
                <span className="text-xs text-slate-500">{session.audio_format}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
                <span>Created: {new Date(session.created_at).toLocaleString()}</span>
                {session.started_at ? (
                  <span>Start: {new Date(session.started_at).toLocaleString()}</span>
                ) : null}
                {session.ended_at ? (
                  <span>End: {new Date(session.ended_at).toLocaleString()}</span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-400">{status}</p>
      )}
    </section>
  );
}
