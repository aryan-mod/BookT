import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp } from 'lucide-react';

const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass px-3 py-2 rounded-xl shadow-2xl border border-violet-500/20">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-bold" style={{ color: p.color || '#a78bfa' }}>
          {p.value} {p.name === 'pages' ? 'pages' : 'books'}
        </p>
      ))}
    </div>
  );
}

export default function ReadingCharts({ monthlyActivity = [] }) {
  const data = useMemo(() => {
    if (!Array.isArray(monthlyActivity) || monthlyActivity.length === 0) {
      return MONTH_ABBR.map((m) => ({ month: m, pages: 0, books: 0 }));
    }
    return monthlyActivity.map((item) => ({
      month: MONTH_ABBR[(item.month ?? item._id?.month ?? 1) - 1] || '?',
      pages: item.pagesRead || item.pages || 0,
      books: item.booksCompleted || item.books || 0,
    }));
  }, [monthlyActivity]);

  const hasData = data.some(d => d.pages > 0 || d.books > 0);

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 rounded-xl bg-violet-500/20">
          <TrendingUp className="w-4 h-4 text-violet-400" />
        </div>
        <h3 className="font-bold text-white text-sm">Reading Activity</h3>
        <span className="ml-auto text-xs text-slate-500">12 months</span>
      </div>

      {!hasData ? (
        <div className="h-40 flex items-center justify-center text-slate-600 text-sm">
          No reading data yet. Start reading to see your stats!
        </div>
      ) : (
        <>
          {/* Area chart for pages */}
          <div className="mb-1">
            <p className="text-xs text-slate-500 font-semibold mb-3">PAGES READ</p>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="violetGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone" dataKey="pages" name="pages"
                  stroke="#7c3aed" strokeWidth={2.5}
                  fill="url(#violetGrad)"
                  dot={false} activeDot={{ r: 5, fill: '#a78bfa', stroke: '#7c3aed', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bar chart for books */}
          <div className="mt-4">
            <p className="text-xs text-slate-500 font-semibold mb-3">BOOKS COMPLETED</p>
            <ResponsiveContainer width="100%" height={80}>
              <BarChart data={data} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="books" name="books" fill="url(#cyanGrad)" radius={[4, 4, 0, 0]} maxBarSize={20} />
                <defs>
                  <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"  stopColor="#06b6d4" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
