"use client";
import { useMemo, useState, useEffect } from "react";
import { format, subDays, startOfDay, startOfWeek, endOfWeek, eachDayOfInterval, subWeeks } from "date-fns";
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell } from "recharts";
export function AnalyticsDashboard({ habits, logs }) {
  const [view, setView] = useState("Weekly");
  const today = startOfDay(new Date());
  const activeHabitsCount = habits.length;
  const data = useMemo(() => {
    if (activeHabitsCount === 0) return [];
    if (view === "Today") {
      const todaysLogs = logs.filter((l) => l.log_date === format(today, "yyyy-MM-dd") && l.status);
      const rate = todaysLogs.length / activeHabitsCount * 100;
      return [{ name: "Today", rate, completed: todaysLogs.length }];
    }
    if (view === "Weekly") {
      const days = Array.from({ length: 7 }).map((_, i) => subDays(today, 6 - i));
      return days.map((day) => {
        const dateStr = format(day, "yyyy-MM-dd");
        const daysLogs = logs.filter((l) => l.log_date === dateStr && l.status);
        const rate = daysLogs.length / activeHabitsCount * 100;
        return {
          name: format(day, "EEEE").charAt(0),
          // M, T, W...
          fullDate: dateStr,
          rate: Math.round(rate),
          completed: daysLogs.length
        };
      });
    }
    if (view === "Monthly") {
      const weeks = Array.from({ length: 4 }).map((_, i) => subWeeks(today, 3 - i));
      return weeks.map((weekStart) => {
        const weekInterval = { start: startOfWeek(weekStart), end: endOfWeek(weekStart) };
        const daysInWeek = eachDayOfInterval(weekInterval);
        let totalCompleted = 0;
        daysInWeek.forEach((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const daysLogs = logs.filter((l) => l.log_date === dateStr && l.status);
          totalCompleted += daysLogs.length;
        });
        const expected = activeHabitsCount * 7;
        const rate = expected === 0 ? 0 : totalCompleted / expected * 100;
        return {
          name: `W${format(weekStart, "w")}`,
          rate: Math.round(rate),
          completed: totalCompleted
        };
      });
    }
    if (view === "Overall") {
      const totalPossible = activeHabitsCount * 30;
      const totalCompleted = logs.filter((l) => l.status).length;
      const rate = totalPossible === 0 ? 0 : totalCompleted / totalPossible * 100;
      return [{ name: "All Time", rate: Math.round(rate), completed: totalCompleted }];
    }
    return [];
  }, [view, logs, activeHabitsCount, today]);
  const averageRate = useMemo(() => {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, curr) => acc + curr.rate, 0);
    return Math.round(sum / data.length);
  }, [data]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return <div className="mx-auto w-full max-w-md pt-24 pb-8">
      <h2 className="mb-6 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 text-center">Analytics</h2>

      <div className="flex justify-center gap-2 mb-8">
        {["Today", "Weekly", "Monthly", "Overall"].map((v) => <button
    key={v}
    onClick={() => setView(v)}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${view === v ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"}`}
  >
            {v}
          </button>)}
      </div>

      <div className="rounded-3xl bg-zinc-900 p-6 text-white shadow-xl dark:bg-zinc-950 border border-zinc-800">
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="text-sm text-zinc-400 font-medium">{view} Completion</p>
            <h3 className="text-4xl font-bold mt-1">{averageRate}%</h3>
          </div>
        </div>

        {view === "Today" || view === "Overall" ? <div className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-8 border-emerald-500/20 relative">
              <div
    className="absolute inset-0 rounded-full border-8 border-emerald-500 border-t-transparent border-l-transparent"
    style={{ transform: `rotate(${45 + averageRate / 100 * 360}deg)` }}
  />
              <span className="text-2xl font-bold">{data[0]?.completed || 0} / {view === "Today" ? activeHabitsCount : "\u2014"}</span>
            </div>
            <p className="mt-4 text-zinc-400 text-sm">Habits completed</p>
          </div> : <div className="h-48 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis
    dataKey="name"
    axisLine={false}
    tickLine={false}
    tick={{ fill: "#a1a1aa", fontSize: 12 }}
    dy={10}
  />
                <Tooltip
    cursor={{ fill: "#27272a" }}
    content={({ active, payload }) => {
      if (active && payload && payload.length) {
        return <div className="bg-zinc-800 p-2 rounded-lg text-xs border border-zinc-700 shadow-xl">
                          <p className="font-medium text-white">{payload[0].payload.rate}%</p>
                          <p className="text-zinc-400">{payload[0].payload.completed} completed</p>
                        </div>;
      }
      return null;
    }}
  />
                <Bar dataKey="rate" radius={[4, 4, 4, 4]} barSize={24}>
                  {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.rate > 0 ? "#10b981" : "#27272a"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>}
      </div>
    </div>;
}
