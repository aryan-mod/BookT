import React, { memo } from 'react';

function BookSkeleton() {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 shadow-sm overflow-hidden">
      <div className="aspect-[3/4] w-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
      <div className="p-4">
        <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="mt-2 h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="mt-4 space-y-2">
          <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-3 w-11/12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-3 w-10/12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="mt-5 h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

export default memo(BookSkeleton);

