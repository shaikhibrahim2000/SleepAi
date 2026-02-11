import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip } from "recharts";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const sleepCycleData = {
  labels: ["10pm", "12am", "2am", "4am", "6am"],
  datasets: [
    {
      label: "Sleep Quality",
      data: [65, 72, 68, 74, 80],
      borderColor: "#22d3ee",
      backgroundColor: "rgba(34, 211, 238, 0.2)",
      tension: 0.4
    }
  ]
};

const disturbanceData = [
  { time: "11pm", events: 2 },
  { time: "1am", events: 5 },
  { time: "3am", events: 1 },
  { time: "5am", events: 3 }
];

export default function Dashboard() {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Sleep Insights Dashboard</h2>
        <span className="text-xs text-slate-400">Sample data</span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-sm text-slate-300">Sleep Quality Trend</p>
          <Line data={sleepCycleData} />
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-sm text-slate-300">Noise Disturbances</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={disturbanceData}>
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <ReTooltip />
                <Bar dataKey="events" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
