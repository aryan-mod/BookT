import { forwardRef } from 'react';

export const Label = forwardRef(({ className = '', ...props }, ref) => (
  <label
    ref={ref}
    className={`text-sm font-medium text-gray-700 dark:text-gray-300 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
    {...props}
  />
));
Label.displayName = 'Label';
