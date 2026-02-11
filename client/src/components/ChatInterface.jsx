import { useState } from "react";

const seedMessages = [
  {
    role: "assistant",
    content: "Share a sleep session summary and I will explain disturbances and trends."
  }
];

export default function ChatInterface() {
  const [messages, setMessages] = useState(seedMessages);
  const [input, setInput] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!input.trim()) return;

    const nextMessages = [
      ...messages,
      { role: "user", content: input.trim() },
      {
        role: "assistant",
        content: "This is a placeholder response. Connect MCP to enable real-time insights."
      }
    ];
    setMessages(nextMessages);
    setInput("");
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <h2 className="text-lg font-semibold">AI Sleep Assistant</h2>
      <p className="text-sm text-slate-400">Chat with the assistant powered by MCP.</p>

      <div className="mt-4 space-y-3">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`rounded-xl px-4 py-3 text-sm ${
              message.role === "assistant"
                ? "bg-slate-950/70 text-slate-200"
                : "bg-cyan-500/20 text-cyan-100"
            }`}
          >
            <p className="text-xs uppercase tracking-wide text-slate-400">{message.role}</p>
            <p className="mt-1">{message.content}</p>
          </div>
        ))}
      </div>

      <form className="mt-4 flex gap-2" onSubmit={handleSubmit}>
        <input
          className="flex-1 rounded-full border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm text-slate-100"
          placeholder="Ask about last night's sleep..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
        <button className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950">
          Send
        </button>
      </form>
    </section>
  );
}
