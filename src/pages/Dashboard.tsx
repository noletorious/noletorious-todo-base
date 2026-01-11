import { useAuthStore } from '../store/authStore';
import { useTodoStore } from '../store/todoStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CloudSun, TrendingUp, Newspaper, Zap, ArrowUpRight } from 'lucide-react';

const sp500Data = [
  { name: 'NVDA', return: 238 },
  { name: 'META', return: 194 },
  { name: 'AMD', return: 127 },
  { name: 'AVGO', return: 109 },
  { name: 'AMZN', return: 80 },
  { name: 'CRM', return: 72 },
  { name: 'GOOGL', return: 58 },
];

const news = [
    { title: "Fed signals potential rate cuts in late 2026", source: "Finance Daily", time: "2h ago" },
    { title: "Tech sector rallies as AI adoption accelerates", source: "TechCrunch", time: "4h ago" },
    { title: "Global markets show resilience amidst uncertainty", source: "Bloomberg", time: "6h ago" },
];

export default function Dashboard() {
  const { user } = useAuthStore();
  const { todos } = useTodoStore();

  if (!user?.isPaid) {
    return (
        <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
            <div className="p-6 bg-primary/10 rounded-full text-primary mb-4">
                <Zap size={48} />
            </div>
            <h2 className="text-3xl font-heading font-bold">Dashboard Locked</h2>
            <p className="text-muted-foreground max-w-md">
                Upgrade to Pro to access real-time market data, weather insights, and your personalized productivity analytics.
            </p>
            <button className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-primary/90 transition">
                Unlock Dashboard ($5/mo)
            </button>
        </div>
    );
  }

  const highlightTask = todos.find(t => t.status === 'IN_PROGRESS' && t.label === 'Urgent') 
                     || todos.find(t => t.status === 'IN_PROGRESS');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-heading font-bold">Welcome back, {user.name}</h1>
            <p className="text-muted-foreground">Here's your daily briefing.</p>
        </div>
        <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg shadow-sm border border-border">
            <CloudSun className="text-yellow-500" />
            <span className="font-medium">San Francisco, 68°F</span>
        </div>
      </div>

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
                        <h2 className="text-3xl font-bold mb-2">{highlightTask.title}</h2>
                        <p className="text-white/80 mb-6 max-w-lg">{highlightTask.description || "Get this done today to stay on track."}</p>
                        <div className="flex gap-4">
                            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-sm border border-white/10">Due Today</span>
                            <span className="bg-white text-primary px-3 py-1 rounded-lg text-sm font-bold shadow-sm">In Progress</span>
                        </div>
                    </div>
                ) : (
                    <div className="py-8">
                        <h2 className="text-2xl font-bold">All caught up!</h2>
                        <p className="text-white/80">Check your backlog to select new tasks.</p>
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
                        <p className="font-medium group-hover:text-primary transition-colors line-clamp-2">{item.title}</p>
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
                <TrendingUp size={18} className="text-green-500" /> S&P 500 Top Performers (YTD)
            </h3>
            <p className="text-sm text-muted-foreground">Market data provided by generic API.</p>
        </div>
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sp500Data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <Tooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="return" fill="var(--color-primary)" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
