import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, BookOpen, Inbox, CheckCircle } from 'lucide-react';
import api from '../../api/axios';
import StatsCard from '../../components/admin/StatsCard';

function getErrorMessage(err) {
  const msg = err.response?.data?.message;
  if (Array.isArray(msg)) return msg.join(', ');
  if (typeof msg === 'string') return msg;
  return err.message || 'Request failed';
}

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBooks: 0,
    pendingRequests: 0,
    approvedToday: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const { data } = await api.get('/admin/stats');
      setStats(data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      <section>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Dashboard overview
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsLoading ? (
            [...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse"
              />
            ))
          ) : (
            <>
              <StatsCard title="Total users" value={stats.totalUsers} icon={Users} delay={0} />
              <StatsCard title="Total books" value={stats.totalBooks} icon={BookOpen} delay={0.05} />
              <StatsCard title="Pending requests" value={stats.pendingRequests} icon={Inbox} delay={0.1} />
              <StatsCard title="Approved today" value={stats.approvedToday} icon={CheckCircle} description="Last 24h" delay={0.15} />
            </>
          )}
        </div>
      </section>

      <section>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 p-6 mb-6"
        >
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
            Stats overview
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Users', value: stats.totalUsers, fill: '#3b82f6' },
                  { name: 'Books', value: stats.totalBooks, fill: '#10b981' },
                  { name: 'Pending', value: stats.pendingRequests, fill: '#f59e0b' },
                  { name: 'Approved today', value: stats.approvedToday, fill: '#6366f1' },
                ]}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    backgroundColor: '#fff',
                  }}
                  labelStyle={{ color: '#374151' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </section>
    </motion.div>
  );
}
