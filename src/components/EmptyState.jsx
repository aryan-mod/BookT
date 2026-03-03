import React, { memo } from 'react';
import { Search, Inbox } from 'lucide-react';

function EmptyState({
  variant = 'prompt',
  title,
  description,
  actionLabel,
  onAction,
}) {
  const Icon = variant === 'no-results' ? Inbox : Search;

  return (
    <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/50 p-10 text-center shadow-sm">
      <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200/70 dark:border-gray-700/60">
        <Icon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      {description ? (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      ) : null}
      {actionLabel && typeof onAction === 'function' ? (
        <div className="mt-6">
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center justify-center rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            {actionLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default memo(EmptyState);

