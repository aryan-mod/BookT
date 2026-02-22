import { useState, useEffect, useCallback, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ban, ShieldCheck, Loader2 } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axios';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString(undefined, { dateStyle: 'medium' });
}

function getErrorMessage(err) {
  const msg = err.response?.data?.message;
  if (Array.isArray(msg)) return msg.join(', ');
  if (typeof msg === 'string') return msg;
  return err.message || 'Request failed';
}

export default function AdminUsers() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get('/admin/users');
      setUsers(data.data?.users ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleBan = async (targetUser) => {
    const id = targetUser?.id || targetUser?._id;
    if (!id) return;
    const currentUserId = user?.id || user?._id;
    if (id === currentUserId) return;

    setTogglingId(id);
    setError(null);
    const wasBanned = targetUser.isBanned;

    setUsers((prev) =>
      prev.map((u) =>
        (u.id || u._id) === id ? { ...u, isBanned: !wasBanned } : u
      )
    );

    try {
      const { data } = await api.patch(`/admin/users/${id}/toggle-ban`);
      setUsers((prev) =>
        prev.map((u) =>
          (u.id || u._id) === id ? { ...u, ...data.data.user } : u
        )
      );
    } catch (err) {
      setError(getErrorMessage(err));
      setUsers((prev) =>
        prev.map((u) =>
          (u.id || u._id) === id ? { ...u, isBanned: wasBanned } : u
        )
      );
    } finally {
      setTogglingId(null);
    }
  };

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
          Users
        </h1>
        <Card>
          {loading ? (
            <CardContent className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </CardContent>
          ) : !users?.length ? (
            <CardContent className="py-12 text-center text-gray-500 dark:text-gray-400">
              No users found.
            </CardContent>
          ) : (
            <>
              <CardHeader>
                <CardTitle>All users</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence mode="popLayout">
                        {users.map((u, index) => {
                          const uid = u.id || u._id;
                          const isCurrentUser = uid === (user?.id || user?._id);
                          const isBanned = u.isBanned ?? false;

                          return (
                            <motion.tr
                              key={uid}
                              layout
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 8 }}
                              transition={{ duration: 0.2, delay: index * 0.02 }}
                              className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                            >
                              <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                                {u.name}
                              </td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                {u.email}
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                  {u.role || 'user'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <Badge variant={isBanned ? 'banned' : 'active'}>
                                  {isBanned ? 'Banned' : 'Active'}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-sm">
                                {formatDate(u.createdAt)}
                              </td>
                              <td className="py-3 px-4 text-right">
                                {isCurrentUser ? (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    (you)
                                  </span>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant={isBanned ? 'success' : 'destructive'}
                                    className={
                                      isBanned
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-0'
                                        : ''
                                    }
                                    loading={togglingId === uid}
                                    disabled={!!togglingId}
                                    onClick={() => handleToggleBan(u)}
                                  >
                                    {togglingId === uid ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : isBanned ? (
                                      <ShieldCheck className="h-4 w-4" />
                                    ) : (
                                      <Ban className="h-4 w-4" />
                                    )}
                                    {isBanned ? 'Unban' : 'Ban'}
                                  </Button>
                                )}
                              </td>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </section>
    </motion.div>
  );
}
