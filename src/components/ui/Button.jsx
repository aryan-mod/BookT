import { forwardRef } from 'react';

const variants = {
  default:
    'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 shadow-sm',
  primary:
    'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
  success:
    'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 shadow-sm',
  destructive:
    'border border-red-500/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 bg-transparent',
  outline:
    'border border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white',
  ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
  link: 'text-blue-600 dark:text-blue-400 underline-offset-4 hover:underline',
};

const sizes = {
  sm: 'h-8 px-3 text-xs rounded-lg',
  default: 'h-10 px-4 text-sm rounded-xl',
  lg: 'h-11 px-6 text-sm rounded-xl',
  icon: 'h-10 w-10 rounded-xl',
};

export const Button = forwardRef(
  (
    {
      className = '',
      variant = 'default',
      size = 'default',
      disabled = false,
      loading = false,
      children,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      type="button"
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:pointer-events-none ${variants[variant] || variants.default} ${sizes[size] || sizes.default} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  )
);
Button.displayName = 'Button';
