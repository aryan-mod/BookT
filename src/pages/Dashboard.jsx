import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import BookTracker from '../components/BookTracker';
import ErrorBoundary from '../components/ErrorBoundary';

export default function Dashboard({ searchQuery }) {
  const { user } = useContext(AuthContext);

  return (
    <ErrorBoundary>
      <BookTracker searchQuery={searchQuery} />
    </ErrorBoundary>
  );
}
