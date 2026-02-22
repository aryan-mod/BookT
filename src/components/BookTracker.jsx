import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useBooks } from '../hooks/useBooks';
import { mockStreakData, suggestedBooks } from '../data/mockData';

import Header from './Header';
import StreakTracker from './StreakTracker';
import StatsPanel from './StatsPanel';
import BookCard from './BookCard';
import BookModal from './BookModal';
import AddBookModal from './AddBookModal';
import EditBookModal from './EditBookModal';
import WordCloud from './WordCloud';
import SuggestedBooks from './SuggestedBooks';

export default function BookTracker() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };
  const { books, loading: booksLoading, error: booksError, addBook, updateBook, deleteBook } = useBooks();
  const [streakData, setStreakData] = useLocalStorage('streakData', mockStreakData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [editingBook, setEditingBook] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const filteredAndSortedBooks = books
    .filter(book => {
      const genres = book.genre || book.categories || [];
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        genres.some(g => String(g).toLowerCase().includes(searchQuery.toLowerCase()));
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
      if (newBook.status === 'reading' && newBook.startDate === new Date().toISOString().split('T')[0]) {
        updateStreakForToday();
      }
    } catch (err) {
      console.error('Failed to add book:', err);
    }
  };

  const handleUpdateBook = async (updatedBook) => {
    try {
      const bookId = updatedBook.id || updatedBook._id;
      await updateBook(bookId, updatedBook);
      if (updatedBook.status === 'completed' && updatedBook.endDate === new Date().toISOString().split('T')[0]) {
        updateStreakForToday();
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
      updateStreakForToday();
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  const updateStreakForToday = () => {
    const today = new Date().getDay();
    setStreakData(prevData => {
      const newWeek = [...(prevData.thisWeek || Array(7).fill(false))];
      newWeek[today] = true;
      let currentStreak = 0;
      for (let i = newWeek.length - 1; i >= 0; i--) {
        if (newWeek[i]) currentStreak++;
        else break;
      }
      return {
        ...prevData,
        thisWeek: newWeek,
        current: Math.max(currentStreak, prevData.current || 0),
        longest: Math.max(currentStreak, prevData.longest || 0)
      };
    });
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

        {!booksLoading && <StatsPanel books={books} />}

        {!booksLoading && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-1">
                <StreakTracker streakData={streakData} onUpdateStreak={updateStreakForToday} />
              </div>
              <div className="lg:col-span-2">
                <WordCloud books={books} />
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
                    <BookCard
                      key={book.id || book._id}
                      book={book}
                      onBookClick={handleBookClick}
                      onBookEdit={handleBookEdit}
                      onReactionClick={handleReactionClick}
                      onProgressUpdate={handleProgressUpdate}
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
      <SuggestedBooks suggestions={suggestedBooks} isVisible={showSuggestions} onClose={() => setShowSuggestions(false)} onAddBook={handleAddBook} />
    </>
  );
}
