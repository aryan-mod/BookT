import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import api from '../api/axios';
import SearchBar from '../components/SearchBar';
import BookCard from '../components/BookCard';
import BookSkeleton from '../components/BookSkeleton';
import EmptyState from '../components/EmptyState';
import useDebounce from '../hooks/useDebounce';
import { ToastContext } from '../context/ToastContext';
import { LibraryContext } from '../context/LibraryContext';

function getBookKey(book) {
  const id = typeof book?.id === 'string' ? book.id : '';
  const source = typeof book?.source === 'string' ? book.source : '';
  return `${source}:${id}`;
}

function getFriendlyError(err) {
  const code = err?.code;
  if (code === 'ERR_CANCELED') return null;

  const status = err?.response?.status;
  if (status === 429) return 'Too many requests. Please slow down and try again.';
  if (status === 401) return 'Please sign in to add books to your library.';
  if (status === 503) return 'Search is temporarily unavailable. Please try again shortly.';

  const msg = err?.response?.data?.message;
  if (typeof msg === 'string' && msg.trim().length > 0) return msg.trim();

  return 'Something went wrong. Please try again.';
}

export default function Explore() {
  const { showToast } = useContext(ToastContext) || {};
  const library = useContext(LibraryContext);
  const addedSet = library?.addedSet || new Set();
  const addToSet = library?.addToSet;
  const initializeFromBackend = library?.initializeFromBackend;

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [addingByKey, setAddingByKey] = useState(() => new Map());

  const abortRef = useRef(null);
  const seqRef = useRef(0);

  const effectiveQuery = useMemo(
    () => (String(debouncedQuery || '').trim() || 'bestsellers'),
    [debouncedQuery]
  );

  useEffect(() => {
    if (page === 1) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  useEffect(() => {
    initializeFromBackend && initializeFromBackend();
  }, [initializeFromBackend]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setError('');
    setPage(1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current?.abort?.();
    abortRef.current = controller;

    const mySeq = ++seqRef.current;

    (async () => {
      setLoading(true);
      setError('');

      try {
        const res = await api.get('/books/search', {
          params: { q: effectiveQuery, page, limit },
          signal: controller.signal,
        });

        if (seqRef.current !== mySeq) return;

        const data = res?.data?.data;
        const list = Array.isArray(data) ? data : [];
        setItems(list);
      } catch (err) {
        if (seqRef.current !== mySeq) return;
        const msg = getFriendlyError(err);
        if (msg) {
          setError(msg);
          setItems([]);
        }
      } finally {
        if (seqRef.current === mySeq) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [effectiveQuery, page, limit]);

  const hasNextPage = useMemo(
    () => Array.isArray(items) && items.length === limit,
    [items, limit]
  );

  const handleAdd = useCallback(
    async (book, keyFromCard) => {
      const key = keyFromCard || getBookKey(book);
      if (!key || addedSet.has(key) || addingByKey.has(key)) return;

      setAddingByKey((prev) => {
        const next = new Map(prev);
        next.set(key, true);
        return next;
      });

      try {
        await api.post('/books/add-external', {
          id: book?.id,
          source: book?.source,
          title: book?.title,
          authors: book?.authors,
          description: book?.description,
          thumbnail: book?.thumbnail,
          pageCount: book?.pageCount,
          publishedDate: book?.publishedDate,
        });

        addToSet && addToSet(key);
        showToast?.('Added to your library.');
      } catch (err) {
        if (err?.response?.status === 409) {
          addToSet && addToSet(key);
          showToast?.('Already in library');
        } else {
          const msg = getFriendlyError(err);
          showToast?.(msg || 'Unable to add book.');
        }
      } finally {
        setAddingByKey((prev) => {
          const next = new Map(prev);
          next.delete(key);
          return next;
        });
      }
    },
    [addedSet, addingByKey, addToSet, showToast]
  );

  const isNoResults = !loading && !error && items.length === 0;
  const isTrending = effectiveQuery === 'bestsellers';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950 transition-colors">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Explore
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Search across Google Books and Open Library, then add to your library.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              <span className="sr-only">Results per page</span>
              <select
                value={limit}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  setLimit(Number.isFinite(next) ? next : 9);
                  setPage(1);
                }}
                className="h-11 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={6}>6</option>
                <option value={9}>9</option>
                <option value={12}>12</option>
              </select>
            </label>
          </div>
        </div>

        <div className="mt-6">
          <SearchBar
            value={query}
            onChange={setQuery}
            onClear={clearSearch}
            placeholder="Search by title, author, or keyword…"
          />
        </div>

        {error ? (
          <div
            className="mt-6 rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-800 dark:text-red-200"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        <div className="mt-8">
          {isNoResults ? (
            <EmptyState
              variant="no-results"
              title={isTrending ? 'No trending books available' : 'No results found'}
              description={
                isTrending
                  ? 'Try again later or search for something specific.'
                  : 'Try a different query, or broaden your search terms.'
              }
              actionLabel={isTrending ? undefined : 'Clear search'}
              onAction={isTrending ? undefined : clearSearch}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading
                ? Array.from({ length: limit }).map((_, idx) => <BookSkeleton key={idx} />)
                : items.map((book) => {
                    const key = getBookKey(book);
                    const isAdded = addedSet.has(key);
                    const isAdding = addingByKey.has(key);
                    return (
                      <BookCard
                        key={key}
                        book={book}
                        onAdd={handleAdd}
                        isAdded={isAdded}
                        isAdding={isAdding}
                      />
                    );
                  })}
            </div>
          )}
        </div>

        {!loading && items.length > 0 ? (
          <div className="mt-10 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => {
                if (loading) return;
                setPage((p) => Math.max(1, p - 1));
              }}
              disabled={page <= 1 || loading}
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              Page <span className="font-semibold text-gray-900 dark:text-white">{page}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (loading || !hasNextPage) return;
                setPage((p) => p + 1);
              }}
              disabled={!hasNextPage || loading}
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        ) : null}
      </main>
    </div>
  );
}
