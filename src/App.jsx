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
import WordCloud from './components/WordCloud';
import SuggestedBooks from './components/SuggestedBooks';

function App() {
  const { theme, toggleTheme } = useTheme();
  const [books, setBooks] = useLocalStorage('books', mockBooks);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filter books based on search query
  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.genre.some(genre => genre.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle book click
  const handleBookClick = (book) => {
    setSelectedBook(book);
    setShowModal(true);
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
      />
      
      <main className="main-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Panel */}
        <StatsPanel books={books} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Streak Tracker */}
          <div className="lg:col-span-1">
            <StreakTracker streakData={mockStreakData} />
          </div>
          
          {/* Word Cloud */}
          <div className="lg:col-span-2">
            <WordCloud />
          </div>
        </div>

        {/* Books Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {searchQuery ? `Search Results (${filteredBooks.length})` : 'Your Library'}
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {books.length} total books
              </span>
            </div>
          </div>

          {filteredBooks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg className="mx-auto h-12 w-12" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchQuery ? 'No books found' : 'No books in your library'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery 
                  ? 'Try adjusting your search terms or browse all books.' 
                  : 'Start by adding some books to track your reading journey.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onBookClick={handleBookClick}
                  onReactionClick={handleReactionClick}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Book Modal */}
      <BookModal
        book={selectedBook}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onReactionClick={handleReactionClick}
      />

      {/* Suggested Books Tooltip */}
      <SuggestedBooks
        suggestions={suggestedBooks}
        isVisible={showSuggestions}
        onClose={() => setShowSuggestions(false)}
      />
    </div>
  );
}

export default App;