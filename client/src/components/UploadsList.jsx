import { useEffect, useState } from "react";
import { supabase } from "../services/supabase.js";

export default function UploadsList({ user }) {
  const [sessions, setSessions] = useState([]);
  const [status, setStatus] = useState("Loading...");
  const [busyId, setBusyId] = useState(null);

  const loadSessions = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("sleep_sessions")
      .select("id, created_at, started_at, ended_at, audio_path, audio_format")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      setStatus(error.message);
      return;
    }

    setSessions(data ?? []);
    setStatus(data?.length ? "" : "No uploads yet.");
  };

  useEffect(() => {
    let ignore = false;

    loadSessions().then(() => {
      if (ignore) return;
    });

    return () => {
      ignore = true;
    };
  }, [user]);

  const deleteSession = async (session) => {
    if (!user || busyId) return;
    setBusyId(session.id);
    setStatus("");

    const { error: storageError } = await supabase.storage
      .from("sleep-audio")
      .remove([session.audio_path]);

    if (storageError) {
      setStatus(storageError.message);
      setBusyId(null);
      return;
    }

    const { error: dbError } = await supabase
      .from("sleep_sessions")
      .delete()
      .eq("id", session.id);

    if (dbError) {
      setStatus(dbError.message);
      setBusyId(null);
      return;
    }

    await loadSessions();
    setBusyId(null);
  };

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
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">{session.audio_format}</span>
                  <button
                    className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-200 disabled:opacity-50"
                    onClick={() => deleteSession(session)}
                    disabled={busyId === session.id}
                  >
                    {busyId === session.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
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
