import AudioRecorder from "./components/AudioRecorder.jsx";
import Dashboard from "./components/Dashboard.jsx";
import ChatInterface from "./components/ChatInterface.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Sleep Sound Analysis</p>
          <h1 className="text-3xl font-semibold">AI-Powered Sleep Sound Analysis</h1>
          <p className="text-slate-300">
            Record nocturnal audio, analyze disturbances, and chat with an AI assistant for insights.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <AudioRecorder />
          <ChatInterface />
        </div>

        <Dashboard />
      </div>
    </div>
  );
}
