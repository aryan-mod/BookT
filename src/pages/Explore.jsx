import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Compass, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import BookCard from '../components/BookCard';
import BookSkeleton from '../components/BookSkeleton';
import useDebounce from '../hooks/useDebounce';
import { ToastContext } from '../context/ToastContext';
import { LibraryContext } from '../context/LibraryContext';

function getBookKey(book) {
  const id = typeof book?.id === 'string' ? book.id : '';
  const source = typeof book?.source === 'string' ? book.source : '';
  return `${source}:${id}`;
}

function getFriendlyError(err) {
  if (err?.code === 'ERR_CANCELED') return null;
  const status = err?.response?.status;
  if (status === 429) return 'Too many requests. Please slow down and try again.';
  if (status === 401) return 'Please sign in to add books to your library.';
  if (status === 503) return 'Search is temporarily unavailable. Please try again.';
  const msg = err?.response?.data?.message;
  if (typeof msg === 'string' && msg.trim().length > 0) return msg.trim();
  return 'Something went wrong. Please try again.';
}

export default function Explore({ searchQuery: globalSearch = '' }) {
  const { showToast } = useContext(ToastContext) || {};
  const library = useContext(LibraryContext);
  const addedSet = library?.addedSet || new Set();
  const addToSet = library?.addToSet;
  const initializeFromBackend = library?.initializeFromBackend;

  const [localQuery, setLocalQuery] = useState('');
  // Use globalSearch from TopBar if provided, else local input
  const effectiveInput = globalSearch || localQuery;
  const debouncedQuery = useDebounce(effectiveInput, 500);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addingByKey, setAddingByKey] = useState(() => new Map());

  const abortRef = useRef(null);
  const seqRef   = useRef(0);

  const effectiveQuery = useMemo(
    () => (String(debouncedQuery || '').trim() || 'bestsellers'),
    [debouncedQuery]
  );

  useEffect(() => { initializeFromBackend?.(); }, [initializeFromBackend]);
  useEffect(() => { setPage(1); }, [effectiveInput]);
  useEffect(() => { if (page !== 1) window.scrollTo({ top: 0, behavior: 'smooth' }); }, [page]);

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
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        if (seqRef.current !== mySeq) return;
        const msg = getFriendlyError(err);
        if (msg) { setError(msg); setItems([]); }
      } finally {
        if (seqRef.current === mySeq) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [effectiveQuery, page, limit]);

  const hasNextPage = items.length === limit;

  const handleAdd = useCallback(async (book, keyFromCard) => {
    const key = keyFromCard || getBookKey(book);
    if (!key || addedSet.has(key) || addingByKey.has(key)) return;
    setAddingByKey(prev => new Map(prev).set(key, true));
    try {
      await api.post('/books/add-external', {
        id: book?.id, source: book?.source, title: book?.title, authors: book?.authors,
        description: book?.description, thumbnail: book?.thumbnail,
        pageCount: book?.pageCount, publishedDate: book?.publishedDate,
      });
      addToSet?.(key);
      showToast?.('Added to your library!');
    } catch (err) {
      if (err?.response?.status === 409) { addToSet?.(key); showToast?.('Already in library'); }
      else showToast?.(getFriendlyError(err) || 'Unable to add book.');
    } finally {
      setAddingByKey(prev => { const m = new Map(prev); m.delete(key); return m; });
    }
  }, [addedSet, addingByKey, addToSet, showToast]);

  const isTrending = effectiveQuery === 'bestsellers';
  const isNoResults = !loading && !error && items.length === 0;

  return (
    <div className="pb-20">
      {/* ── Hero ─────────────────────────── */}
      <div className="relative overflow-hidden border-b border-white/[0.04] bg-gradient-to-r from-[#080814] via-[#09091f] to-[#080814] pt-10 pb-12">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[150px] bg-cyan-600/8 blur-[80px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/25 text-cyan-400 text-xs font-semibold flex items-center gap-1">
                <Compass className="w-3 h-3" /> Discover
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Explore <span className="gradient-text-cyan">Books</span>
            </h1>
            <p className="mt-2 text-slate-500 text-sm max-w-md">
              Search across Google Books and Open Library, then add to your library.
            </p>
          </motion.div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="mt-6 max-w-xl"
          >
            <div className="relative group/es">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500 group-focus-within/es:text-cyan-400 transition-colors w-[18px] h-[18px]" />
              <input
                type="text"
                value={localQuery}
                onChange={(e) => { setLocalQuery(e.target.value); }}
                placeholder="Search by title, author, or keyword…"
                className="w-full pl-11 pr-10 py-3 bg-white/[0.04] border border-white/[0.08] rounded-2xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/40 focus:bg-white/[0.07] transition-all duration-300"
              />
              {localQuery && (
                <button
                  onClick={() => { setLocalQuery(''); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-600 hover:text-slate-400 hover:bg-white/5 transition-colors"
                >
                  ×
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Content ──────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">

        {/* Section label */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            {isTrending && <Sparkles className="w-4 h-4 text-amber-400" />}
            <h2 className="text-sm font-bold text-white">
              {isTrending ? 'Trending Bestsellers' : `Results for "${effectiveInput}"`}
            </h2>
            {!loading && items.length > 0 && (
              <span className="text-xs text-slate-600 font-mono">{items.length} books</span>
            )}
          </div>
          <select
            value={limit}
            onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
            className="nx-select text-xs py-1.5 pl-2.5 pr-7"
          >
            <option value={6} className="bg-[#12122a]">6 per page</option>
            <option value={9} className="bg-[#12122a]">9 per page</option>
            <option value={12} className="bg-[#12122a]">12 per page</option>
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="glass border border-red-500/25 rounded-xl px-4 py-3 text-sm text-red-300 mb-6" role="alert">
            {error}
          </div>
        )}

        {/* Grid */}
        {isNoResults ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-5">
              <Search className="w-8 h-8 text-slate-700" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {isTrending ? 'No trending books' : 'No results found'}
            </h3>
            <p className="text-slate-600 text-sm max-w-xs">
              {isTrending ? 'Try again shortly or search for a specific book.' : 'Try different keywords or broaden your search.'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {loading
              ? Array.from({ length: limit }).map((_, i) => <BookSkeleton key={i} />)
              : items.map(book => {
                  const key = getBookKey(book);
                  return (
                    <BookCard
                      key={key}
                      book={book}
                      onAdd={handleAdd}
                      isAdded={addedSet.has(key)}
                      isAdding={addingByKey.has(key)}
                    />
                  );
                })
            }
          </motion.div>
        )}

        {/* Pagination */}
        {!loading && items.length > 0 && (
          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/[0.08] text-sm font-medium text-slate-300 hover:text-white hover:border-violet-500/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-sm text-slate-500 font-mono">Page {page}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!hasNextPage}
              className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/[0.08] text-sm font-medium text-slate-300 hover:text-white hover:border-violet-500/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
