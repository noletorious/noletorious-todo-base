import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useTodoStore } from "../store/todoStore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  CloudSun,
  TrendingUp,
  Newspaper,
  Zap,
  ArrowUpRight,
} from "lucide-react";
import { UpgradeScreen } from "../components/ui/UpgradeScreen";

const sp500Data = [
  { name: "NVDA", return: 238 },
  { name: "META", return: 194 },
  { name: "AMD", return: 127 },
  { name: "AVGO", return: 109 },
  { name: "AMZN", return: 80 },
  { name: "CRM", return: 72 },
  { name: "GOOGL", return: 58 },
];

const news = [
  {
    title: "Fed signals potential rate cuts in late 2026",
    source: "Finance Daily",
    time: "2h ago",
  },
  {
    title: "Tech sector rallies as AI adoption accelerates",
    source: "TechCrunch",
    time: "4h ago",
  },
  {
    title: "Global markets show resilience amidst uncertainty",
    source: "Bloomberg",
    time: "6h ago",
  },
];

export default function Dashboard() {
  const { user } = useAuthStore();
  const { todos } = useTodoStore();
  const [activeTab, setActiveTab] = useState("today");

  if (!user?.isPaid) {
    return (
      <UpgradeScreen
        variant="dashboard"
        onUpgrade={() => alert("Stripe integration coming soon!")}
      />
    );
  }

  const highlightTask =
    todos.find((t) => t.status === "IN_PROGRESS" && t.label === "Urgent") ||
    todos.find((t) => t.status === "IN_PROGRESS");

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">
            Welcome back, {user.name || "User"}
          </h1>
          <p className="text-muted-foreground">Here's your daily briefing.</p>
        </div>
        <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg shadow-sm border border-border">
          <CloudSun className="text-yellow-500" />
          <span className="font-medium">San Francisco, 68°F</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {["today", "projects", "sprints", "settings"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "today" && (
        <div className="space-y-6">
          {/* Today content */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Highlight Task Card */}
            <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-primary to-violet-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-white/80 mb-2 text-sm font-medium uppercase tracking-wider">
                  <Zap size={16} /> Most Important Task
                </div>
                {highlightTask ? (
                  <div>
                    <h2 className="text-3xl font-bold mb-2">
                      {highlightTask.title}
                    </h2>
                    <p className="text-white/80 mb-6 max-w-lg">
                      {highlightTask.description ||
                        "Get this done today to stay on track."}
                    </p>
                    <div className="flex gap-4">
                      <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-sm border border-white/10">
                        Due Today
                      </span>
                      <span className="bg-white text-primary px-3 py-1 rounded-lg text-sm font-bold shadow-sm">
                        In progress
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-8">
                    <h2 className="text-2xl font-bold">All caught up!</h2>
                    <p className="text-white/80">
                      Check your backlog to select new tasks.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* News Feed */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col">
              <h3 className="flex items-center gap-2 font-bold text-lg mb-4">
                <Newspaper size={18} className="text-primary" /> Latest News
              </h3>
              <div className="space-y-4 flex-1">
                {news.map((item, i) => (
                  <div key={i} className="group cursor-pointer">
                    <p className="font-medium group-hover:text-primary transition-colors line-clamp-2">
                      {item.title}
                    </p>
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <span>{item.source}</span>
                      <span>{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-xs font-bold text-primary flex items-center justify-center gap-1 hover:underline">
                View All <ArrowUpRight size={12} />
              </button>
            </div>
          </div>

          {/* S&P 500 Chart */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="flex items-center gap-2 font-bold text-lg">
                <TrendingUp size={18} className="text-green-500" /> S&P 500 Top
                Performers (YTD)
              </h3>
              <p className="text-sm text-muted-foreground">
                Market data provided by generic API.
              </p>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sp500Data}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                    opacity={0.5}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="return"
                    fill="var(--color-primary)"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === "projects" && (
        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-xl font-semibold mb-4">Project Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  defaultValue="My Project"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Kanban Columns
                </label>
                <p className="text-sm text-muted-foreground mb-3">
                  Customize your workflow columns (3-5 columns max)
                </p>
                <div className="space-y-2">
                  <input
                    type="text"
                    defaultValue="Selected"
                    className="w-full px-3 py-2 border border-border rounded-lg"
                  />
                  <input
                    type="text"
                    defaultValue="In progress"
                    className="w-full px-3 py-2 border border-border rounded-lg"
                  />
                  <input
                    type="text"
                    defaultValue="Done"
                    disabled
                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "sprints" && (
        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Sprint Management</h2>
            <p className="text-muted-foreground mb-4">
              Sprint functionality is coming soon! This will allow you to:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 mb-6">
              <li>• Run sprints for 1-3 weeks</li>
              <li>• Track velocity and burndown</li>
              <li>• One active sprint per project</li>
            </ul>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm font-medium">🚀 Coming in next update</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-xl font-semibold mb-4">Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Archive Management</h3>
                  <p className="text-sm text-muted-foreground">
                    View and manage archived tasks
                  </p>
                </div>
                <button className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">
                  View Archive
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Data Export</h3>
                  <p className="text-sm text-muted-foreground">
                    Export your project data
                  </p>
                </div>
                <button className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors">
                  Export
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Reset Project</h3>
                  <p className="text-sm text-muted-foreground">
                    Clear all tasks and start fresh
                  </p>
                </div>
                <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
