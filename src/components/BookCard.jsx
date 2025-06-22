import React, { useEffect, useRef, useState } from 'react';
import { Star, Clock, BookOpen, Heart, MessageCircle, Share2, MoreHorizontal, Edit, Play, Pause } from 'lucide-react';
import { gsap } from 'gsap';

const BookCard = ({ book, onBookClick, onBookEdit, onReactionClick, onProgressUpdate }) => {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(book.currentPage || 0);

  useEffect(() => {
    const card = cardRef.current;
    
    gsap.fromTo(card,
      { y: 50, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "power3.out" }
    );
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
    gsap.to(cardRef.current, {
      y: -8,
      scale: 1.02,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowMenu(false);
    gsap.to(cardRef.current, {
      y: 0,
      scale: 1,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'reading': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'wishlist': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getProgress = () => {
    if (book.status === 'completed') return 100;
    if (book.status === 'reading' && book.currentPage) {
      return Math.round((book.currentPage / book.pages) * 100);
    }
    return 0;
  };

  const handleProgressChange = (e) => {
    e.stopPropagation();
    const newPage = parseInt(e.target.value);
    setCurrentPage(newPage);
    onProgressUpdate(book.id, newPage);
  };

  const quickReactions = ['❤️', '👍', '🔥', '📚'];

  return (
    <div
      ref={cardRef}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/20 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl dark:hover:shadow-gray-900/40 group relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onBookClick(book)}
    >
      <div className="relative">
        <img
          src={book.cover}
          alt={book.title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(book.status)}`}>
            {book.status}
          </span>
        </div>
        
        <div className="absolute top-4 right-4">
          <div className="relative">
            <button 
              className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors duration-200"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
            >
              <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-10 min-w-[120px]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onBookEdit(book);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              </div>
            )}
          </div>
        </div>
        
        {book.status === 'reading' && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
            <div className="bg-white/20 rounded-full h-2 mb-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${getProgress()}%` }}
              ></div>
            </div>
            <p className="text-white text-sm font-medium">{getProgress()}% complete</p>
          </div>
        )}

        {/* Quick reaction overlay */}
        {isHovered && (
          <div className="absolute bottom-4 right-4 flex space-x-1">
            {quickReactions.map((emoji) => (
              <button
                key={emoji}
                onClick={(e) => {
                  e.stopPropagation();
                  onReactionClick(book.id, emoji);
                }}
                className="w-8 h-8 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200"
              >
                <span className="text-sm">{emoji}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
              {book.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">by {book.author}</p>
          </div>
          {book.rating && (
            <div className="flex items-center space-x-1 ml-4">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {book.rating}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {book.genre.slice(0, 3).map((genre, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
            >
              {genre}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <BookOpen className="h-4 w-4" />
              <span>{book.pages} pages</span>
            </div>
            {book.startDate && (
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{new Date(book.startDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Reading Progress for Currently Reading Books */}
        {book.status === 'reading' && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Reading Progress
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {currentPage} / {book.pages}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={book.pages}
              value={currentPage}
              onChange={handleProgressChange}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {book.reactions && Object.keys(book.reactions).length > 0 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              {Object.entries(book.reactions).slice(0, 3).map(([emoji, count]) => (
                <button
                  key={emoji}
                  onClick={(e) => {
                    e.stopPropagation();
                    onReactionClick(book.id, emoji);
                  }}
                  className="flex items-center space-x-1 px-2 py-1 rounded-full bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  <span className="text-sm">{emoji}</span>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{count}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={(e) => e.stopPropagation()}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
              >
                <Heart className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button>
              <button 
                onClick={(e) => e.stopPropagation()}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
              >
                <MessageCircle className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button>
              <button 
                onClick={(e) => e.stopPropagation()}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
              >
                <Share2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookCard;