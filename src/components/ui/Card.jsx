import { forwardRef } from 'react';

export const Card = forwardRef(({ className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-white dark:bg-gray-800/80 shadow-sm dark:shadow-gray-900/30 ${className}`}
    {...props}
  />
));
Card.displayName = 'Card';

export const CardHeader = forwardRef(({ className = '', ...props }, ref) => (
  <div ref={ref} className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef(({ className = '', ...props }, ref) => (
  <h3 ref={ref} className={`text-lg font-semibold leading-none tracking-tight text-gray-900 dark:text-white ${className}`} {...props} />
));
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef(({ className = '', ...props }, ref) => (
  <p ref={ref} className={`text-sm text-gray-500 dark:text-gray-400 ${className}`} {...props} />
));
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef(({ className = '', ...props }, ref) => (
  <div ref={ref} className={`p-6 pt-0 ${className}`} {...props} />
));
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef(({ className = '', ...props }, ref) => (
  <div ref={ref} className={`flex items-center p-6 pt-0 ${className}`} {...props} />
));
CardFooter.displayName = 'CardFooter';
