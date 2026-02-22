import { forwardRef } from 'react';

const variants = {
  default: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
  pending: 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200',
  approved: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200',
  rejected: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200',
  active: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200',
  banned: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200',
};

export const Badge = forwardRef(({ className = '', variant = 'default', ...props }, ref) => (
  <span
    ref={ref}
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant] || variants.default} ${className}`}
    {...props}
  />
));
Badge.displayName = 'Badge';
