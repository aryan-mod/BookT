import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { useTheme } from './hooks/useTheme';
import { useLocalStorage } from './hooks/useLocalStorage';
import { mockBooks, mockStreakData, suggestedBooks } from './data/mockData';

import Header from './components/Header';
import StreakTracker from './components/StreakTracker';
import StatsPanel from './components/StatsPanel';
import BookCard from './components/BookCard';
import BookModal from './components/BookModal';
import AddBookModal from './components/AddBookModal';
import EditBookModal from './components/EditBookModal';
import WordCloud from './components/WordCloud';
import SuggestedBooks from './components/SuggestedBooks';

function App() {
  const { theme, toggleTheme } = useTheme();
  const [books, setBooks] = useLocalStorage('books', mockBooks);
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

  // Filter and sort books
  const filteredAndSortedBooks = books
    .filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.genre.some(genre => genre.toLowerCase().includes(searchQuery.toLowerCase()));
      
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
          return new Date(b.startDate || b.id) - new Date(a.startDate || a.id);
      }
    });

  // Handle book click
  const handleBookClick = (book) => {
    setSelectedBook(book);
    setShowModal(true);
  };

  // Handle book edit
  const handleBookEdit = (book) => {
    setEditingBook(book);
    setShowEditModal(true);
  };

  // Handle reaction click
  const handleReactionClick = (bookId, emoji) => {
    setBooks(prevBooks =>
      prevBooks.map(book => {
        if (book.id === bookId) {
          const newReactions = { ...book.reactions };
          newReactions[emoji] = (newReactions[emoji] || 0) + 1;
          return { ...book, reactions: newReactions };
        }
        return book;
      })
    );
  };

  // Add new book
  const handleAddBook = (newBook) => {
    setBooks(prevBooks => [newBook, ...prevBooks]);
    
    // Update streak if book is started today
    if (newBook.status === 'reading' && newBook.startDate === new Date().toISOString().split('T')[0]) {
      updateStreakForToday();
    }
  };

  // Update book
  const handleUpdateBook = (updatedBook) => {
    setBooks(prevBooks =>
      prevBooks.map(book => book.id === updatedBook.id ? updatedBook : book)
    );
    
    // Update streak if book was completed today
    if (updatedBook.status === 'completed' && updatedBook.endDate === new Date().toISOString().split('T')[0]) {
      updateStreakForToday();
    }
  };

  // Delete book
  const handleDeleteBook = (bookId) => {
    setBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
  };

  // Update reading progress
  const handleProgressUpdate = (bookId, currentPage) => {
    setBooks(prevBooks =>
      prevBooks.map(book => {
        if (book.id === bookId) {
          const progress = Math.round((currentPage / book.pages) * 100);
          return { ...book, currentPage, progress };
        }
        return book;
      })
    );
    
    // Update streak for reading activity
    updateStreakForToday();
  };

  // Update streak data
  const updateStreakForToday = () => {
    const today = new Date().getDay(); // 0 = Sunday, 6 = Saturday
    setStreakData(prevData => {
      const newWeek = [...prevData.thisWeek];
      newWeek[today] = true;
      
      // Calculate new current streak
      let currentStreak = 0;
      for (let i = newWeek.length - 1; i >= 0; i--) {
        if (newWeek[i]) {
          currentStreak++;
        } else {
          break;
        }
      }
      
      return {
        ...prevData,
        thisWeek: newWeek,
        current: Math.max(currentStreak, prevData.current),
        longest: Math.max(currentStreak, prevData.longest)
      };
    });
  };

  // Show suggestions after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSuggestions(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // GSAP animation for main content
  useEffect(() => {
    gsap.fromTo('.main-content',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.5 }
    );
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 transition-colors duration-300">
      <Header 
        theme={theme}
        toggleTheme={toggleTheme}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onAddBook={() => setShowAddModal(true)}
      />
      
      <main className="main-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Panel */}
        <StatsPanel books={books} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Streak Tracker */}
          <div className="lg:col-span-1">
            <StreakTracker 
              streakData={streakData} 
              onUpdateStreak={updateStreakForToday}
            />
          </div>
          
          {/* Word Cloud */}
          <div className="lg:col-span-2">
            <WordCloud books={books} />
          </div>
        </div>

        {/* Books Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {searchQuery ? `Search Results (${filteredAndSortedBooks.length})` : 'Your Library'}
            </h2>
            
            <div className="flex items-center space-x-4">
              {/* Filter */}
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

              {/* Sort */}
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

              <div className="text-sm text-gray-600 dark:text-gray-400">
                {books.length} total books
              </div>
            </div>
          </div>

          {filteredAndSortedBooks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg className="mx-auto h-12 w-12" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchQuery || filterStatus !== 'all' ? 'No books found' : 'No books in your library'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchQuery || filterStatus !== 'all'
                  ? 'Try adjusting your search terms or filters.' 
                  : 'Start by adding some books to track your reading journey.'
                }
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
                  key={book.id}
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
      </main>

      {/* Book Detail Modal */}
      <BookModal
        book={selectedBook}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onReactionClick={handleReactionClick}
        onEdit={handleBookEdit}
      />

      {/* Add Book Modal */}
      <AddBookModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddBook={handleAddBook}
      />

      {/* Edit Book Modal */}
      <EditBookModal
        book={editingBook}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onUpdateBook={handleUpdateBook}
        onDeleteBook={handleDeleteBook}
      />

      {/* Suggested Books Tooltip */}
      <SuggestedBooks
        suggestions={suggestedBooks}
        isVisible={showSuggestions}
        onClose={() => setShowSuggestions(false)}
        onAddBook={handleAddBook}
      />
    </div>
  );
}

export default App;