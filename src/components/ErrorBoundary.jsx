import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(_error, _errorInfo) {
    // Intentionally no console.log to keep production clean
  }

  render() {
    const { hasError } = this.state;
    const { fallback, children } = this.props;

    if (hasError) {
      if (fallback) return fallback;

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full rounded-2xl bg-white dark:bg-gray-800 shadow-lg p-8 text-center space-y-4">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Something went wrong
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              An unexpected error occurred while rendering this page. Please refresh and try again.
            </p>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;

