import { useEffect, useState } from "react";
import AudioRecorder from "./components/AudioRecorder.jsx";
import Dashboard from "./components/Dashboard.jsx";
import ChatInterface from "./components/ChatInterface.jsx";
import AuthPanel from "./components/AuthPanel.jsx";
import UploadsList from "./components/UploadsList.jsx";
import { supabase } from "./services/supabase.js";

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    let ignore = false;

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!ignore) {
        setSession(data.session);
      }
    };

    loadSession();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => {
      ignore = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Sleep Sound Analysis</p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-semibold">AI-Powered Sleep Sound Analysis</h1>
            {session ? (
              <button
                className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200"
                onClick={() => supabase.auth.signOut()}
              >
                Sign out
              </button>
            ) : null}
          </div>
          <p className="text-slate-300">
            Record nocturnal audio, analyze disturbances, and chat with an AI assistant for insights.
          </p>
        </header>

        {!session ? (
          <AuthPanel />
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <AudioRecorder user={session.user} />
              <ChatInterface />
            </div>
            <UploadsList user={session.user} />
          </>
        )}

        <Dashboard />
      </div>
    </div>
  );
}
