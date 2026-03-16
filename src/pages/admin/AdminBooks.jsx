import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BookCheck, Star, Tag, TrendingUp, Eye, EyeOff, Sparkles, Search, RefreshCw } from 'lucide-react';
import api from '../../api/axios';

function Toggle({ checked, onChange, label }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
        checked ? 'bg-violet-600' : 'bg-gray-300 dark:bg-gray-600'
      }`}
      title={label}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
    </button>
  );
}

function PriceEditor({ bookId, currentPrice, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(currentPrice || 0);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api.patch(`/admin/marketplace/books/${bookId}`, { price: parseFloat(val) || 0 });
      onUpdated(bookId, { price: parseFloat(val) || 0 });
      setEditing(false);
    } catch {}
    setSaving(false);
  };

  if (!editing) return (
    <button onClick={() => setEditing(true)} className="text-sm font-semibold text-violet-600 dark:text-violet-400 hover:underline">
      {currentPrice ? `₹${currentPrice}` : 'Free'}
    </button>
  );

  return (
    <div className="flex items-center gap-1 w-28">
      <span className="text-xs text-gray-500">₹</span>
      <input type="number" min="0" value={val} onChange={(e) => setVal(e.target.value)}
        className="w-16 px-2 py-1 rounded border border-violet-400 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none" autoFocus />
      <button onClick={save} disabled={saving} className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-800 disabled:opacity-50">
        {saving ? '…' : '✓'}
      </button>
      <button onClick={() => setEditing(false)} className="text-xs text-gray-400 hover:text-gray-700">✕</button>
    </div>
  );
}

export default function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [saving, setSaving] = useState({});

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15, sort: 'newest' };
      if (search) params.search = search;
      const { data } = await api.get('/marketplace', { params });
      setBooks(data?.data?.books || []);
      setTotalPages(data?.data?.pagination?.pages || 1);
    } catch {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { setPage(1); }, [search]);
  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const updateBook = useCallback(async (bookId, fields) => {
    setSaving((p) => ({ ...p, [bookId]: true }));
    try {
      await api.patch(`/admin/marketplace/books/${bookId}`, fields);
      setBooks((prev) => prev.map((b) => String(b._id) === String(bookId) ? { ...b, ...fields } : b));
    } catch {}
    setSaving((p) => ({ ...p, [bookId]: false }));
  }, []);

  const handleFieldUpdate = (bookId, fields) => {
    setBooks((prev) => prev.map((b) => String(b._id) === String(bookId) ? { ...b, ...fields } : b));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <BookCheck className="w-5 h-5 text-violet-500" /> Marketplace Books
        </h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search books…"
              className="pl-8 pr-4 h-9 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
          <button onClick={fetchBooks} className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Book</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Price</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Featured</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Premium</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Approved</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Rating</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {books.map((book) => {
                  const cover = book.cover || book.coverImage;
                  return (
                    <tr key={book._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-12 rounded-md overflow-hidden bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-950 dark:to-indigo-950 flex-shrink-0">
                            {cover ? <img src={cover} alt="" className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-violet-400 text-xs">📖</div>}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white text-xs truncate max-w-36">{book.title}</p>
                            <p className="text-gray-400 text-xs truncate max-w-36">{book.author}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <PriceEditor bookId={book._id} currentPrice={book.price} onUpdated={handleFieldUpdate} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Toggle
                          checked={!!book.isFeatured}
                          onChange={(v) => updateBook(book._id, { isFeatured: v })}
                          label="Toggle Featured"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Toggle
                          checked={!!book.isPremium}
                          onChange={(v) => updateBook(book._id, { isPremium: v })}
                          label="Toggle Premium"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Toggle
                          checked={book.isApproved !== false}
                          onChange={(v) => updateBook(book._id, { isApproved: v })}
                          label="Toggle Approved"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="flex items-center justify-center gap-1 text-amber-500 font-semibold text-xs">
                          <Star className="w-3 h-3 fill-amber-500" />
                          {book.averageRating?.toFixed(1) || '—'}
                        </span>
                        <span className="text-gray-400 text-xs">{book.reviewCount || 0} reviews</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-violet-600 dark:text-violet-400 font-semibold text-xs flex items-center justify-center gap-1">
                          <TrendingUp className="w-3 h-3" />{book.salesCount || 0}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {books.length === 0 && (
              <div className="py-16 text-center text-gray-400">No books found.</div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 p-4 border-t border-gray-100 dark:border-gray-700">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium disabled:opacity-40 hover:border-violet-400 transition-colors">Prev</button>
            <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium disabled:opacity-40 hover:border-violet-400 transition-colors">Next</button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
