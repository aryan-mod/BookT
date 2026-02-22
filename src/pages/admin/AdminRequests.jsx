import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, Inbox, CheckCircle } from 'lucide-react';
import api from '../../api/axios';
import StatsCard from '../../components/admin/StatsCard';
import RequestsTable from '../../components/admin/RequestsTable';
import RequestDrawer from '../../components/admin/RequestDrawer';

function getErrorMessage(err) {
  const msg = err.response?.data?.message;
  if (Array.isArray(msg)) return msg.join(', ');
  if (typeof msg === 'string') return msg;
  return err.message || 'Request failed';
}

export default function AdminRequests() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBooks: 0,
    pendingRequests: 0,
    approvedToday: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [processingId, setProcessingId] = useState(null);
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

  const fetchRequests = useCallback(async () => {
    try {
      setRequestsLoading(true);
      const { data } = await api.get('/book-requests/pending');
      setRequests(data.data?.requests ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const removeRequestOptimistic = useCallback((id, approved) => {
    setRequests((prev) => prev.filter((r) => (r.id || r._id) !== id));
    setStats((s) => ({
      ...s,
      pendingRequests: Math.max(0, s.pendingRequests - 1),
      approvedToday: approved ? s.approvedToday + 1 : s.approvedToday,
    }));
    setSelectedRequest((r) => (r && (r.id || r._id) === id ? null : r));
    setDrawerOpen(false);
  }, []);

  const handleApprove = async (request) => {
    const id = request?.id || request?._id;
    if (!id) return;
    setProcessingId(id);
    setError(null);
    try {
      await api.post(`/book-requests/${id}/approve`);
      removeRequestOptimistic(id, true);
      fetchStats();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (request) => {
    const id = request?.id || request?._id;
    if (!id) return;
    setProcessingId(id);
    setError(null);
    try {
      await api.post(`/book-requests/${id}/reject`);
      removeRequestOptimistic(id, false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (request) => {
    const id = request?.id || request?._id;
    if (!id) return;
    setProcessingId(id);
    setError(null);
    try {
      await api.delete(`/book-requests/${id}`);
      removeRequestOptimistic(id, false);
      fetchStats();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setProcessingId(null);
    }
  };

  const openDrawer = (request) => {
    setSelectedRequest(request);
    setDrawerOpen(true);
  };

  return (
    <>
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
            Pending requests
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
          <RequestsTable
            requests={requests}
            loading={requestsLoading}
            onApprove={handleApprove}
            onReject={handleReject}
            onDelete={handleDelete}
            onRowClick={openDrawer}
            processingId={processingId}
          />
        </section>
      </motion.div>

      <RequestDrawer
        open={drawerOpen}
        request={selectedRequest}
        onClose={() => { setDrawerOpen(false); setSelectedRequest(null); }}
        onApprove={handleApprove}
        onReject={handleReject}
        processing={!!processingId}
      />
    </>
  );
}
