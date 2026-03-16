import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, BookOpen, Inbox, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../api/axios';

function StatCard({ title, value, icon: Icon, color, delay = 0, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card p-5 relative overflow-hidden"
    >
      <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-10 blur-2xl" style={{ background: color }} />
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 rounded-xl" style={{ background: `${color}20` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      {loading ? (
        <div className="skeleton h-8 w-20 rounded mb-1" />
      ) : (
        <div className="text-2xl font-extrabold text-white mb-0.5">{value?.toLocaleString() ?? '—'}</div>
      )}
      <div className="text-xs text-slate-500 font-medium">{title}</div>
    </motion.div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass px-3 py-2 rounded-xl border border-white/10 shadow-2xl text-sm">
      {label && <p className="text-slate-400 text-xs mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="font-bold" style={{ color: p.fill }}>{p.value}</p>
      ))}
    </div>
  );
}

export default function AdminOverview() {
  const [stats, setStats] = useState({ totalUsers: 0, totalBooks: 0, pendingRequests: 0, approvedToday: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const { data } = await api.get('/admin/stats');
      setStats(data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load stats');
    } finally { setStatsLoading(false); }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const chartData = [
    { name: 'Users',   value: stats.totalUsers,       fill: '#7c3aed' },
    { name: 'Books',   value: stats.totalBooks,        fill: '#06b6d4' },
    { name: 'Pending', value: stats.pendingRequests,   fill: '#f59e0b' },
    { name: 'Today',   value: stats.approvedToday,     fill: '#10b981' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white mb-1">Admin Overview</h1>
        <p className="text-slate-500 text-sm">Platform-wide statistics and activity</p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users"       value={stats.totalUsers}       icon={Users}        color="#7c3aed" delay={0}    loading={statsLoading} />
        <StatCard title="Total Books"       value={stats.totalBooks}       icon={BookOpen}     color="#06b6d4" delay={0.06} loading={statsLoading} />
        <StatCard title="Pending Requests"  value={stats.pendingRequests}  icon={Inbox}        color="#f59e0b" delay={0.12} loading={statsLoading} />
        <StatCard title="Approved Today"    value={stats.approvedToday}    icon={CheckCircle}  color="#10b981" delay={0.18} loading={statsLoading} />
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card p-5"
      >
        <h2 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
          <div className="w-1.5 h-4 bg-gradient-to-b from-violet-500 to-cyan-500 rounded-full" />
          Platform Statistics
        </h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} opacity={0.85} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
