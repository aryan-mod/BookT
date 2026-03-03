import { createContext, useCallback, useState } from 'react';
import api from '../api/axios';

export const LibraryContext = createContext(null);

export function LibraryProvider({ children }) {
  const [addedSet, setAddedSet] = useState(() => new Set());
  const [initialized, setInitialized] = useState(false);
  const [initializing, setInitializing] = useState(false);

  const addToSet = useCallback((key) => {
    if (!key) return;
    setAddedSet((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, []);

  const initializeFromBackend = useCallback(async () => {
    if (initialized || initializing) return;
    setInitializing(true);
    try {
      const res = await api.get('/books/user-external-ids');
      const keys = res?.data?.data?.keys;
      if (Array.isArray(keys)) {
        setAddedSet(new Set(keys));
      }
      setInitialized(true);
    } catch {
      // Best-effort; search UX still works even if this fails.
    } finally {
      setInitializing(false);
    }
  }, [initialized, initializing]);

  return (
    <LibraryContext.Provider value={{ addedSet, addToSet, initializeFromBackend }}>
      {children}
    </LibraryContext.Provider>
  );
}

