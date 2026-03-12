import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { useBooks } from '../hooks/useBooks';
import { suggestedBooks as mockSuggestedBooks } from '../data/mockData';
import api from '../api/axios';

import Header from './Header';
import StreakTracker from './StreakTracker';
import StatsPanel from './StatsPanel';
import ReadingCharts from './ReadingCharts';
import ReadingHeatmap from './ReadingHeatmap';
import LibraryBookCard from './LibraryBookCard';
import BookModal from './BookModal';
import AddBookModal from './AddBookModal';
import EditBookModal from './EditBookModal';
import WordCloud from './WordCloud';
import SuggestedBooks from './SuggestedBooks';
import ReadingActivityFeed from './ReadingActivityFeed';

export default function BookTracker() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };
  const {
    books = [],
    loading: booksLoading,
    error: booksError,
    addBook,
    updateBook,
    deleteBook,
  } = useBooks();
  const [streakData, setStreakData] = useState({
    current: 0,
    longest: 0,
    thisWeek: [false, false, false, false, false, false, false],
  });
  const [dashboardStats, setDashboardStats] = useState(null);
  const [activity, setActivity] = useState({ monthlyActivity: [], dailyActivity: [] });
  const [goalSummary, setGoalSummary] = useState(null);
  const [goalYearInput, setGoalYearInput] = useState(() => new Date().getFullYear());
  const [goalTargetInput, setGoalTargetInput] = useState('');
  const [goalSaving, setGoalSaving] = useState(false);
  const [goalError, setGoalError] = useState(null);
  const [suggestions, setSuggestions] = useState(mockSuggestedBooks);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(null);
  const [activityFeed, setActivityFeed] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [editingBook, setEditingBook] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const filteredAndSortedBooks = (Array.isArray(books) ? books : [])
    .filter(book => {
      const genres = Array.isArray(book.genre)
        ? book.genre
        : Array.isArray(book.categories)
        ? book.categories
        : [];
      const title = typeof book.title === 'string' ? book.title : '';
      const author = typeof book.author === 'string' ? book.author : '';
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        title.toLowerCase().includes(query) ||
        author.toLowerCase().includes(query) ||
        genres.some((g) => String(g).toLowerCase().includes(query));
      const matchesFilter = filterStatus === 'all' || book.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'pages':
          return (b.pages || 0) - (a.pages || 0);
        case 'recent':
        default:
          const dateA = b.createdAt ? new Date(b.createdAt) : (b.startDate ? new Date(b.startDate) : new Date(b.id || b._id));
          const dateB = a.createdAt ? new Date(a.createdAt) : (a.startDate ? new Date(a.startDate) : new Date(a.id || a._id));
          return dateB - dateA;
      }
    });

  const handleBookClick = (book) => {
    setSelectedBook(book);
    setShowModal(true);
  };

  const handleBookEdit = (book) => {
    setEditingBook(book);
    setShowEditModal(true);
  };

  const handleReactionClick = async (bookId, emoji) => {
    const book = books.find(b => b.id === bookId || b._id === bookId);
    if (!book) return;
    const newReactions = { ...book.reactions };
    newReactions[emoji] = (newReactions[emoji] || 0) + 1;
    try {
      await updateBook(bookId, { ...book, reactions: newReactions });
    } catch (err) {
      console.error('Failed to update reaction:', err);
    }
  };

  const handleAddBook = async (newBook) => {
    try {
      await addBook(newBook);
      // Streak & analytics are server-derived; refresh after mutations.
      try {
        const [statsRes, streakRes, activityRes, goalsRes, recsRes, feedRes] =
          await Promise.all([
            api.get('/reader/dashboard/stats'),
            api.get('/reader/dashboard/streak'),
            api.get('/reader/dashboard/activity'),
            api.get('/reader/goals'),
            api.get('/reader/dashboard/recommendations'),
            api.get('/reader/dashboard/feed'),
          ]);

        setDashboardStats(statsRes.data?.data || null);

        const streak = streakRes.data?.data;
        if (streak) {
          setStreakData({
            current: streak.current || 0,
            longest: streak.longest || 0,
            thisWeek:
              Array.isArray(streak.thisWeek) && streak.thisWeek.length === 7
                ? streak.thisWeek
                : [false, false, false, false, false, false, false],
          });
        }

        setActivity(activityRes.data?.data || { monthlyActivity: [], dailyActivity: [] });
        setActivityFeed(feedRes.data?.data?.items || []);

        const goal = goalsRes.data?.data || null;
        setGoalSummary(goal);

        const serverSuggestions = recsRes.data?.data?.suggestions;
        if (Array.isArray(serverSuggestions) && serverSuggestions.length > 0) {
          setSuggestions(serverSuggestions);
        }
      } catch {
        // Best-effort refresh; ignore to avoid blocking add.
      }
    } catch (err) {
      console.error('Failed to add book:', err);
    }
  };

  const handleUpdateBook = async (updatedBook) => {
    try {
      const bookId = updatedBook.id || updatedBook._id;
      await updateBook(bookId, updatedBook);
      // Streak & analytics are server-derived; refresh after mutations.
      try {
        const [statsRes, streakRes, activityRes, goalsRes, recsRes, feedRes] =
          await Promise.all([
            api.get('/reader/dashboard/stats'),
            api.get('/reader/dashboard/streak'),
            api.get('/reader/dashboard/activity'),
            api.get('/reader/goals'),
            api.get('/reader/dashboard/recommendations'),
            api.get('/reader/dashboard/feed'),
          ]);

        setDashboardStats(statsRes.data?.data || null);

        const streak = streakRes.data?.data;
        if (streak) {
          setStreakData({
            current: streak.current || 0,
            longest: streak.longest || 0,
            thisWeek:
              Array.isArray(streak.thisWeek) && streak.thisWeek.length === 7
                ? streak.thisWeek
                : [false, false, false, false, false, false, false],
          });
        }

        setActivity(activityRes.data?.data || { monthlyActivity: [], dailyActivity: [] });
        setActivityFeed(feedRes.data?.data?.items || []);

        const goal = goalsRes.data?.data || null;
        setGoalSummary(goal);

        const serverSuggestions = recsRes.data?.data?.suggestions;
        if (Array.isArray(serverSuggestions) && serverSuggestions.length > 0) {
          setSuggestions(serverSuggestions);
        }
      } catch {
        // Best-effort refresh; ignore to avoid blocking update.
      }
    } catch (err) {
      console.error('Failed to update book:', err);
    }
  };

  const handleDeleteBook = async (bookId) => {
    try {
      await deleteBook(bookId);
    } catch (err) {
      console.error('Failed to delete book:', err);
    }
  };

  const handleProgressUpdate = async (bookId, currentPage) => {
    const book = books.find(b => b.id === bookId || b._id === bookId);
    if (!book) return;
    try {
      await updateBook(bookId, { ...book, currentPage });
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowSuggestions(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    gsap.fromTo('.main-content',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.5 }
    );
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchAnalytics = async () => {
      try {
        setAnalyticsLoading(true);
        setAnalyticsError(null);

        const [
          statsRes,
          streakRes,
          activityRes,
          goalsRes,
          recsRes,
          feedRes,
        ] = await Promise.all([
          api.get('/reader/dashboard/stats'),
          api.get('/reader/dashboard/streak'),
          api.get('/reader/dashboard/activity'),
          api.get('/reader/goals'),
          api.get('/reader/dashboard/recommendations'),
          api.get('/reader/dashboard/feed'),
        ]);

        if (!isMounted) return;

        setDashboardStats(statsRes.data?.data || null);
        const streak = streakRes.data?.data;
        if (streak) {
          setStreakData({
            current: streak.current || 0,
            longest: streak.longest || 0,
            thisWeek:
              Array.isArray(streak.thisWeek) && streak.thisWeek.length === 7
                ? streak.thisWeek
                : [false, false, false, false, false, false, false],
          });
        }

        setActivity(
          activityRes.data?.data || { monthlyActivity: [], dailyActivity: [] }
        );
        setActivityFeed(feedRes.data?.data?.items || []);
        const goal = goalsRes.data?.data || null;
        setGoalSummary(goal);
        if (goal) {
          setGoalYearInput(goal.year || new Date().getFullYear());
          setGoalTargetInput(
            Number.isFinite(goal.targetBooks) && goal.targetBooks > 0
              ? String(goal.targetBooks)
              : ''
          );
        }

        const serverSuggestions = recsRes.data?.data?.suggestions;
        if (Array.isArray(serverSuggestions) && serverSuggestions.length > 0) {
          setSuggestions(serverSuggestions);
        }
      } catch (err) {
        if (!isMounted) return;
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'Failed to load dashboard analytics';
        setAnalyticsError(msg);
      } finally {
        if (isMounted) setAnalyticsLoading(false);
      }
    };

    fetchAnalytics();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveGoal = async (e) => {
    e?.preventDefault();
    setGoalError(null);
    const year = Number(goalYearInput) || new Date().getFullYear();
    const target = Number(goalTargetInput);
    if (!Number.isInteger(target) || target <= 0) {
      setGoalError('Please enter a positive integer for target books.');
      return;
    }
    try {
      setGoalSaving(true);
      const res = await api.post('/reader/goals', {
        year,
        targetBooks: target,
      });
      const goal = res.data?.data || null;
      if (goal) {
        setGoalSummary(goal);
        setGoalYearInput(goal.year || year);
        setGoalTargetInput(String(goal.targetBooks || target));
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to save goal. Please try again.';
      setGoalError(msg);
    } finally {
      setGoalSaving(false);
    }
  };

  return (
    <>
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onAddBook={() => setShowAddModal(true)}
        user={user}
        onLogout={handleLogout}
      />

      <main className="main-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {analyticsError && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6 text-sm text-yellow-900 dark:text-yellow-100">
            {analyticsError}
          </div>
        )}
        {booksLoading && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg className="animate-spin mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Loading books...</p>
          </div>
        )}

        {booksError && !booksLoading && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
            <p className="text-red-800 dark:text-red-200">Error loading books: {booksError}</p>
          </div>
        )}

        {!booksLoading && (
          <StatsPanel books={books} analytics={dashboardStats} />
        )}

        {!booksLoading && (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
              <div className="xl:col-span-1 space-y-8">
                <StreakTracker streakData={streakData} />
                <ReadingActivityFeed items={activityFeed} />
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {goalSummary?.year || goalYearInput} Reading Goal
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {goalSummary
                      ? `${goalSummary.completedBooks} of ${goalSummary.targetBooks || 0} books completed${
                          goalSummary.targetBooks ? '' : ' (no goal set yet).'
                        }`
                      : 'Set a yearly reading goal to track your progress.'}
                  </p>
                  <div className="w-full bg-gray-200 dark:bg-gray-800 h-2 rounded-full overflow-hidden mb-2">
                    <div
                      className="bg-blue-500 h-2 transition-all duration-300"
                      style={{ width: `${goalSummary?.progress || 0}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    {goalSummary?.progress || 0}% of yearly goal
                  </div>

                  <form onSubmit={handleSaveGoal} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Year
                        </label>
                        <input
                          type="number"
                          value={goalYearInput}
                          onChange={(e) => setGoalYearInput(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Target books
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={goalTargetInput}
                          onChange={(e) => setGoalTargetInput(e.target.value)}
                          placeholder="e.g. 24"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    {goalError && (
                      <p className="text-xs text-red-500 dark:text-red-400">{goalError}</p>
                    )}
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={goalSaving}
                        className="px-4 py-2 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                      >
                        {goalSaving ? 'Saving…' : goalSummary ? 'Update Goal' : 'Set Goal'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              <div className="xl:col-span-2 space-y-8">
                <WordCloud books={books} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ReadingCharts monthlyActivity={activity.monthlyActivity} />
                  <ReadingHeatmap dailyActivity={activity.dailyActivity} />
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {searchQuery ? `Search Results (${filteredAndSortedBooks.length})` : 'Your Library'}
                </h2>
                <div className="flex items-center space-x-4">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Books</option>
                    <option value="reading">Currently Reading</option>
                    <option value="completed">Completed</option>
                    <option value="wishlist">Wishlist</option>
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="recent">Recently Added</option>
                    <option value="title">Title A-Z</option>
                    <option value="author">Author A-Z</option>
                    <option value="rating">Highest Rated</option>
                    <option value="pages">Most Pages</option>
                  </select>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{books.length} total books</div>
                </div>
              </div>

              {filteredAndSortedBooks.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {searchQuery || filterStatus !== 'all' ? 'No books found' : 'No books in your library'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {searchQuery || filterStatus !== 'all' ? 'Try adjusting your search terms or filters.' : 'Start by adding some books to track your reading journey.'}
                  </p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium"
                  >
                    Add Your First Book
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredAndSortedBooks.map((book) => (
                    <LibraryBookCard
                      key={book.id || book._id}
                      book={book}
                      onBookClick={handleBookClick}
                      onBookEdit={handleBookEdit}
                      onReactionClick={handleReactionClick}
                      onProgressUpdate={handleProgressUpdate}
                      onReadUploaded={
                        book.type === 'uploaded'
                          ? () => navigate(`/reader/${book.id || book._id}`)
                          : undefined
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      <BookModal book={selectedBook} isOpen={showModal} onClose={() => setShowModal(false)} onReactionClick={handleReactionClick} onEdit={handleBookEdit} />
      <AddBookModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAddBook={handleAddBook} />
      <EditBookModal book={editingBook} isOpen={showEditModal} onClose={() => setShowEditModal(false)} onUpdateBook={handleUpdateBook} onDeleteBook={handleDeleteBook} />
      <SuggestedBooks suggestions={suggestions} isVisible={showSuggestions} onClose={() => setShowSuggestions(false)} onAddBook={handleAddBook} />
    </>
  );
}
