import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import BookTracker from '../components/BookTracker';
import ErrorBoundary from '../components/ErrorBoundary';

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 transition-colors duration-300">
        <BookTracker />
      </div>
    </ErrorBoundary>
  );
}
