import { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target, TrendingUp, Sparkles, AlertCircle, Library,
  Grid3X3, List, BookOpen, Flame
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useBooks } from '../hooks/useBooks';
import { suggestedBooks as mockSuggestedBooks } from '../data/mockData';
import api from '../api/axios';
import StatsPanel from './StatsPanel';
import StreakTracker from './StreakTracker';
import LibraryBookCard from './LibraryBookCard';
import BookModal from './BookModal';
import AddBookModal from './AddBookModal';
import EditBookModal from './EditBookModal';
import SuggestedBooks from './SuggestedBooks';
import ReadingActivityFeed from './ReadingActivityFeed';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.4 } },
};

export default function BookTracker({ searchQuery = '' }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const { books = [], loading: booksLoading, error: booksError, addBook, updateBook, deleteBook } = useBooks();

  const [streakData, setStreakData]           = useState({ current: 0, longest: 0, thisWeek: Array(7).fill(false) });
  const [dashboardStats, setDashboardStats]   = useState(null);
  const [activity, setActivity]               = useState({ monthlyActivity: [], dailyActivity: [] });
  const [goalSummary, setGoalSummary]         = useState(null);
  const [goalYearInput, setGoalYearInput]     = useState(() => new Date().getFullYear());
  const [goalTargetInput, setGoalTargetInput] = useState('');
  const [goalSaving, setGoalSaving]           = useState(false);
  const [goalError, setGoalError]             = useState(null);
  const [suggestions, setSuggestions]         = useState(mockSuggestedBooks);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError]   = useState(null);
  const [activityFeed, setActivityFeed]       = useState([]);
  const [selectedBook, setSelectedBook]       = useState(null);
  const [editingBook, setEditingBook]         = useState(null);
  const [showModal, setShowModal]             = useState(false);
  const [showAddModal, setShowAddModal]       = useState(false);
  const [showEditModal, setShowEditModal]     = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filterStatus, setFilterStatus]       = useState('all');
  const [sortBy, setSortBy]                   = useState('recent');
  const [viewMode, setViewMode]               = useState('grid'); // 'grid' | 'list'

  // ── Filtering & sorting ──────────────────────────────────────
  const filteredAndSortedBooks = useMemo(() => (
    (Array.isArray(books) ? books : [])
      .filter(book => {
        const genres = Array.isArray(book.genre) ? book.genre : (Array.isArray(book.categories) ? book.categories : []);
        const title  = typeof book.title === 'string' ? book.title : '';
        const author = typeof book.author === 'string' ? book.author : '';
        const query  = searchQuery.toLowerCase();
        const matchSearch = !query || title.toLowerCase().includes(query) || author.toLowerCase().includes(query) || genres.some(g => String(g).toLowerCase().includes(query));
        const matchFilter = filterStatus === 'all' || book.status === filterStatus;
        return matchSearch && matchFilter;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'title':  return a.title.localeCompare(b.title);
          case 'author': return a.author.localeCompare(b.author);
          case 'rating': return (b.rating || 0) - (a.rating || 0);
          case 'pages':  return (b.pages || 0) - (a.pages || 0);
          default: {
            const dA = new Date(b.createdAt || b.startDate || b.id || b._id);
            const dB = new Date(a.createdAt || a.startDate || a.id || a._id);
            return dA - dB;
          }
        }
      })
  ), [books, searchQuery, filterStatus, sortBy]);

  // ── Analytics fetch ─────────────────────────────────────────
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setAnalyticsLoading(true);
        const [statsRes, streakRes, activityRes, goalsRes, recsRes, feedRes] = await Promise.all([
          api.get('/reader/dashboard/stats'),
          api.get('/reader/dashboard/streak'),
          api.get('/reader/dashboard/activity'),
          api.get('/reader/goals'),
          api.get('/reader/dashboard/recommendations'),
          api.get('/reader/dashboard/feed'),
        ]);
        if (!alive) return;
        setDashboardStats(statsRes.data?.data || null);
        const streak = streakRes.data?.data;
        if (streak) setStreakData({ current: streak.current || 0, longest: streak.longest || 0, thisWeek: Array.isArray(streak.thisWeek) && streak.thisWeek.length === 7 ? streak.thisWeek : Array(7).fill(false) });
        setActivity(activityRes.data?.data || { monthlyActivity: [], dailyActivity: [] });
        setActivityFeed(feedRes.data?.data?.items || []);
        const goal = goalsRes.data?.data || null;
        setGoalSummary(goal);
        if (goal) {
          setGoalYearInput(goal.year || new Date().getFullYear());
          setGoalTargetInput(Number.isFinite(goal.targetBooks) && goal.targetBooks > 0 ? String(goal.targetBooks) : '');
        }
        const serverSuggestions = recsRes.data?.data?.suggestions;
        if (Array.isArray(serverSuggestions) && serverSuggestions.length > 0) setSuggestions(serverSuggestions);
      } catch (err) {
        if (alive) setAnalyticsError(err?.response?.data?.message || err?.message || 'Failed to load dashboard');
      } finally {
        if (alive) setAnalyticsLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setShowSuggestions(true), 5000);
    return () => clearTimeout(t);
  }, []);

  // ── Mutation helpers ────────────────────────────────────────
  const refreshAnalytics = async () => {
    try {
      const [statsRes, streakRes, activityRes, goalsRes, recsRes, feedRes] = await Promise.all([
        api.get('/reader/dashboard/stats'),
        api.get('/reader/dashboard/streak'),
        api.get('/reader/dashboard/activity'),
        api.get('/reader/goals'),
        api.get('/reader/dashboard/recommendations'),
        api.get('/reader/dashboard/feed'),
      ]);
      setDashboardStats(statsRes.data?.data || null);
      const streak = streakRes.data?.data;
      if (streak) setStreakData({ current: streak.current || 0, longest: streak.longest || 0, thisWeek: Array.isArray(streak.thisWeek) && streak.thisWeek.length === 7 ? streak.thisWeek : Array(7).fill(false) });
      setActivity(activityRes.data?.data || { monthlyActivity: [], dailyActivity: [] });
      setActivityFeed(feedRes.data?.data?.items || []);
      const goal = goalsRes.data?.data || null;
      setGoalSummary(goal);
      const serverSuggestions = recsRes.data?.data?.suggestions;
      if (Array.isArray(serverSuggestions) && serverSuggestions.length > 0) setSuggestions(serverSuggestions);
    } catch { /* best-effort */ }
  };

  const handleAddBook    = async (book) => { try { await addBook(book); await refreshAnalytics(); } catch { } };
  const handleUpdateBook = async (book) => { try { await updateBook(book.id || book._id, book); await refreshAnalytics(); } catch { } };
  const handleDeleteBook = async (id)   => { try { await deleteBook(id); } catch { } };
  const handleProgressUpdate = async (bookId, currentPage) => {
    const book = books.find(b => b.id === bookId || b._id === bookId);
    if (!book) return;
    try { await updateBook(bookId, { ...book, currentPage }); } catch { }
  };
  const handleReactionClick = async (bookId, emoji) => {
    const book = books.find(b => b.id === bookId || b._id === bookId);
    if (!book) return;
    const newReactions = { ...book.reactions, [emoji]: (book.reactions?.[emoji] || 0) + 1 };
    try { await updateBook(bookId, { ...book, reactions: newReactions }); } catch { }
  };
  const handleSaveGoal = async (e) => {
    e?.preventDefault();
    setGoalError(null);
    const year = Number(goalYearInput) || new Date().getFullYear();
    const target = Number(goalTargetInput);
    if (!Number.isInteger(target) || target <= 0) { setGoalError('Please enter a positive number.'); return; }
    try {
      setGoalSaving(true);
      const res = await api.post('/reader/goals', { year, targetBooks: target });
      const goal = res.data?.data || null;
      if (goal) { setGoalSummary(goal); setGoalYearInput(goal.year || year); setGoalTargetInput(String(goal.targetBooks || target)); }
    } catch (err) {
      setGoalError(err?.response?.data?.message || err?.message || 'Failed to save goal.');
    } finally {
      setGoalSaving(false);
    }
  };

  // ── READING STATUS TABS ─────────────────────────────────────
  const statusTabs = [
    { value: 'all',       label: 'All',       count: books.length },
    { value: 'reading',   label: 'Reading',   count: books.filter(b => b.status === 'reading').length },
    { value: 'completed', label: 'Completed', count: books.filter(b => b.status === 'completed').length },
    { value: 'wishlist',  label: 'Wishlist',  count: books.filter(b => b.status === 'wishlist').length },
  ];

  // ── RENDER ──────────────────────────────────────────────────
  return (
    <div className="pb-20">
      {/* ── Hero section ────────────────────────── */}
      <div className="relative overflow-hidden border-b border-white/[0.04] bg-gradient-to-r from-[#080814] via-[#090920] to-[#080814] pt-10 pb-12">
        {/* Radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-violet-600/10 blur-[80px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="px-2.5 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/25 text-violet-400 text-xs font-semibold flex items-center gap-1">
                <Flame className="w-3 h-3" />
                {streakData.current > 0 ? `${streakData.current}-day streak` : 'Start your streak!'}
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome back,{' '}
              <span className="gradient-text">{user?.name?.split(' ')[0] || 'Reader'}</span>
            </h1>
            <p className="mt-2 text-slate-400 text-sm max-w-md">
              Your reading universe is ready. Dive into your collection or explore new worlds.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">

        {/* Error banner */}
        {analyticsError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass border border-red-500/25 rounded-xl p-4 mb-6 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <span className="text-sm text-red-300">{analyticsError}</span>
          </motion.div>
        )}

        {/* ── KPI Stats ─────────────────────────── */}
        <StatsPanel books={books} analytics={dashboardStats} loading={analyticsLoading} />

        {/* ── Streak + Goal + Activity Row ──────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6 mb-6">

          {/* Streak */}
          <div className="hover:-translate-y-1 transition-transform duration-300">
            <StreakTracker streakData={streakData} />
          </div>

          {/* Reading Goal */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card p-5 relative overflow-hidden group"
          >
            <div className="absolute -right-8 -top-8 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/18 transition-colors" />
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <div className="p-2 rounded-xl bg-cyan-500/20"><Target className="w-4 h-4 text-cyan-400" /></div>
              <h3 className="font-bold text-white text-sm">{goalSummary?.year || goalYearInput} Reading Goal</h3>
            </div>
            <div className="relative z-10 mb-4">
              <div className="flex items-end justify-between mb-2">
                <span className="text-2xl font-black text-white">{goalSummary?.completedBooks || 0}</span>
                <span className="text-sm text-slate-500 mb-1">of {goalSummary?.targetBooks || '—'}</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, goalSummary?.progress || 0)}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #06b6d4, #3b82f6)', boxShadow: '0 0 10px rgba(6,182,212,0.5)' }}
                />
              </div>
              <p className="text-xs text-cyan-400 mt-1.5 font-medium">{goalSummary?.progress || 0}% Complete</p>
            </div>
            <form onSubmit={handleSaveGoal} className="space-y-2 relative z-10 border-t border-white/[0.06] pt-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Year</label>
                  <input type="number" value={goalYearInput} onChange={e => setGoalYearInput(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-sm text-white outline-none focus:ring-1 focus:ring-cyan-500/50" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Target</label>
                  <input type="number" min="1" value={goalTargetInput} onChange={e => setGoalTargetInput(e.target.value)} placeholder="e.g. 24"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-sm text-white outline-none focus:ring-1 focus:ring-cyan-500/50" />
                </div>
              </div>
              {goalError && <p className="text-xs text-red-400 bg-red-500/10 px-2.5 py-1.5 rounded-lg">{goalError}</p>}
              <button type="submit" disabled={goalSaving}
                className="w-full py-2 rounded-lg text-xs font-bold text-white transition-all bg-white/[0.04] hover:bg-cyan-600/15 border border-white/[0.08] hover:border-cyan-500/40 hover:text-cyan-400 disabled:opacity-50">
                {goalSaving ? 'Saving…' : goalSummary ? 'Update Target' : 'Set Goal'}
              </button>
            </form>
          </motion.div>

          {/* Activity Feed */}
          <div className="border border-white/[0.05] rounded-2xl bg-white/[0.03] overflow-hidden">
            <div className="p-4 border-b border-white/[0.05] bg-white/[0.03] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-bold text-white">Recent Activity</h3>
            </div>
            <div className="h-64 overflow-y-auto custom-scrollbar p-2">
              <ReadingActivityFeed items={activityFeed} />
            </div>
          </div>
        </div>

        {/* ── Library Section ───────────────────── */}
        <div className="glass-card-static p-5 sm:p-6 relative">
          <div className="absolute top-0 left-8 w-28 h-[2px] bg-gradient-to-r from-violet-500 to-cyan-500 rounded-b-full" />

          {/* Library header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-violet-600/20 border border-violet-500/25">
                <Library className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  My Library
                  <span className="px-2 py-0.5 rounded-full bg-white/[0.08] text-xs font-mono text-slate-400">
                    {filteredAndSortedBooks.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-600 hidden sm:block">Your complete reading collection</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              {/* Status filter tabs */}
              <div className="flex gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/[0.06]">
                {statusTabs.map(tab => (
                  <button
                    key={tab.value}
                    onClick={() => setFilterStatus(tab.value)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      filterStatus === tab.value
                        ? 'bg-violet-600/30 text-violet-300 border border-violet-500/30'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span className="ml-1 text-slate-600">{tab.count}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="nx-select text-xs py-1.5 pl-2.5 pr-7"
              >
                <option value="recent" className="bg-[#12122a]">Recent</option>
                <option value="title"  className="bg-[#12122a]">Title A-Z</option>
                <option value="author" className="bg-[#12122a]">Author</option>
                <option value="rating" className="bg-[#12122a]">Rating</option>
                <option value="pages"  className="bg-[#12122a]">Pages</option>
              </select>

              {/* Grid/List toggle */}
              <div className="flex bg-white/[0.04] rounded-xl border border-white/[0.06] p-0.5 gap-0.5">
                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-violet-600/30 text-violet-400' : 'text-slate-600 hover:text-slate-400'}`}>
                  <Grid3X3 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-violet-600/30 text-violet-400' : 'text-slate-600 hover:text-slate-400'}`}>
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add book */}
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-nx-primary text-xs px-3 py-1.5 flex items-center gap-1.5 whitespace-nowrap"
              >
                <BookOpen className="w-3.5 h-3.5" /> Add Book
              </button>
            </div>
          </div>

          {/* Loading state */}
          {booksLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-4">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 border-4 border-violet-500/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-t-violet-500 rounded-full animate-spin" />
              </div>
              <p className="text-sm animate-pulse">Loading library…</p>
            </div>
          ) : booksError ? (
            <div className="glass border border-red-500/25 rounded-xl p-6 mb-8 text-center">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
              <p className="text-red-300 text-sm">Unable to load books.</p>
            </div>
          ) : filteredAndSortedBooks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 px-4"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-5">
                <Library className="w-8 h-8 text-slate-700" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {searchQuery || filterStatus !== 'all' ? 'No results found' : 'Your library is empty'}
              </h3>
              <p className="text-slate-600 text-sm mb-8 max-w-xs mx-auto">
                {searchQuery || filterStatus !== 'all'
                  ? 'Try different filters or keywords.'
                  : 'Upload a PDF or explore the marketplace to get started.'}
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-nx-primary px-6 py-2.5 text-sm"
              >
                Add Your First Book
              </button>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className={viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
                : 'flex flex-col gap-3'
              }
            >
              {filteredAndSortedBooks.map((book) => (
                <motion.div key={book.id || book._id} variants={itemVariants}>
                  <LibraryBookCard
                    book={book}
                    viewMode={viewMode}
                    onBookClick={(b) => { setSelectedBook(b); setShowModal(true); }}
                    onBookEdit={(b) => { setEditingBook(b); setShowEditModal(true); }}
                    onReactionClick={handleReactionClick}
                    onProgressUpdate={handleProgressUpdate}
                    onReadUploaded={book.type === 'uploaded' ? () => navigate(`/reader/${book.id || book._id}`) : undefined}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Modals ────────────────────────────────── */}
      <BookModal
        book={selectedBook}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onReactionClick={handleReactionClick}
        onEdit={(b) => { setEditingBook(b); setShowEditModal(true); setShowModal(false); }}
      />
      <AddBookModal  isOpen={showAddModal}  onClose={() => setShowAddModal(false)}  onAddBook={handleAddBook} />
      <EditBookModal book={editingBook} isOpen={showEditModal} onClose={() => setShowEditModal(false)} onUpdateBook={handleUpdateBook} onDeleteBook={handleDeleteBook} />
      <SuggestedBooks suggestions={suggestions} isVisible={showSuggestions} onClose={() => setShowSuggestions(false)} onAddBook={handleAddBook} />
    </div>
  );
}
