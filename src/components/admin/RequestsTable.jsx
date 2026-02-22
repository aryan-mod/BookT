import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Loader2, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { dateStyle: 'medium' });
}

function RequestedBy({ request }) {
  const u = request.requestedBy;
  if (!u) return <span className="text-gray-500">—</span>;
  return <span className="text-gray-900 dark:text-white">{typeof u === 'object' ? u.name : u}</span>;
}

export default function RequestsTable({
  requests,
  loading,
  onApprove,
  onReject,
  onDelete,
  onRowClick,
  processingId,
}) {
  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  if (!requests?.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500 dark:text-gray-400">
          No pending requests.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending book requests</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Title
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Author
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Requested by
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {requests.map((request, index) => (
                  <motion.tr
                    key={request.id || request._id}
                    layout
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer"
                    onClick={() => onRowClick?.(request)}
                  >
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {request.title}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{request.author}</td>
                    <td className="py-3 px-4">
                      <RequestedBy request={request} />
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="pending">Pending</Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="success"
                          loading={processingId === (request.id || request._id)}
                          disabled={!!processingId}
                          onClick={() => onApprove?.(request)}
                        >
                          <Check className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          loading={processingId === (request.id || request._id)}
                          disabled={!!processingId}
                          onClick={() => onReject?.(request)}
                        >
                          <X className="h-4 w-4" />
                          Reject
                        </Button>
                        {onDelete && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="bg-red-600 hover:bg-red-700 text-white border-0"
                            loading={processingId === (request.id || request._id)}
                            disabled={!!processingId}
                            onClick={() => onDelete?.(request)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete Permanently
                          </Button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
