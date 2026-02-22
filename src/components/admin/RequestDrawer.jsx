import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString(undefined, { dateStyle: 'medium' });
}

export default function RequestDrawer({ open, request, onClose, onApprove, onReject, processing }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const requestedBy = request?.requestedBy;
  const name = typeof requestedBy === 'object' ? requestedBy?.name : requestedBy;
  const email = typeof requestedBy === 'object' ? requestedBy?.email : null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Request details</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {request && (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</h3>
                    <p className="mt-0.5 text-gray-900 dark:text-white font-medium">{request.title}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Author</h3>
                    <p className="mt-0.5 text-gray-900 dark:text-white">{request.author}</p>
                  </div>
                  {(request.pages > 0 || request.genre?.length > 0) && (
                    <div className="flex gap-4 flex-wrap">
                      {request.pages > 0 && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {request.pages} pages
                        </span>
                      )}
                      {request.genre?.length > 0 && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {(request.genre || request.categories || []).join(', ')}
                        </span>
                      )}
                    </div>
                  )}
                  {request.description && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Description
                      </h3>
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {request.description}
                      </p>
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Requested by
                    </h3>
                    <p className="mt-0.5 text-gray-900 dark:text-white">{name || '—'}</p>
                    {email && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{email}</p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</h3>
                    <p className="mt-0.5 text-gray-600 dark:text-gray-400">
                      {formatDate(request.createdAt)}
                    </p>
                  </div>
                  <div>
                    <Badge variant="pending">Pending</Badge>
                  </div>
                </>
              )}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex gap-2">
              <Button
                variant="success"
                className="flex-1"
                loading={processing}
                disabled={processing}
                onClick={() => onApprove?.(request)}
              >
                <Check className="h-4 w-4" />
                Approve
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                loading={processing}
                disabled={processing}
                onClick={() => onReject?.(request)}
              >
                <X className="h-4 w-4" />
                Reject
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
