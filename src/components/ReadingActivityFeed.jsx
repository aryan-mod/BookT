import React, { useMemo } from 'react';
import { BookOpen, CheckCircle2, Heart, Sparkles } from 'lucide-react';

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function formatWhen(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Recently';

  const today = startOfDay(new Date());
  const that = startOfDay(d);
  const diffDays = Math.round((today - that) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

function getIcon(type) {
  switch (type) {
    case 'completed':
      return CheckCircle2;
    case 'highlight':
      return Sparkles;
    case 'wishlist':
      return Heart;
    case 'session':
    case 'progress':
    case 'started':
    default:
      return BookOpen;
  }
}

function buildText(item) {
  const title = item?.title || 'a book';
  const type = item?.type;
  const meta = item?.meta || {};

  if (type === 'completed') return `Completed ${title}`;
  if (type === 'wishlist') return `Added ${title} to wishlist`;
  if (type === 'highlight') return `Added a highlight in ${title}`;
  if (type === 'session') {
    const minutes = Number(meta.minutes) || 0;
    return minutes ? `Read for ${minutes}m of ${title}` : `Read ${title}`;
  }
  if (type === 'progress') {
    const page = Number(meta.currentPage) || 0;
    return page ? `Read up to page ${page} of ${title}` : `Read ${title}`;
  }
  if (type === 'started') return `Started ${title}`;
  return `Read ${title}`;
}

export default function ReadingActivityFeed({ items }) {
  const list = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Reading Activity
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {list.length ? `${list.length} recent` : 'No recent activity'}
        </span>
      </div>

      {list.length === 0 ? (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Start reading or add highlights to see your recent activity here.
        </div>
      ) : (
        <ul className="space-y-3">
          {list.slice(0, 8).map((item, idx) => {
            const Icon = getIcon(item?.type);
            const when = formatWhen(item?.date);
            const text = buildText(item);
            return (
              <li
                key={`${item?.type || 'item'}-${item?.date || idx}-${idx}`}
                className="flex items-start gap-3"
              >
                <div className="mt-0.5 h-9 w-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                  <Icon className="h-4 w-4 text-gray-700 dark:text-gray-200" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    <span className="text-gray-500 dark:text-gray-400 mr-2">
                      {when}:
                    </span>
                    <span className="font-medium">{text}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

