import React, { useEffect, useRef, useState } from 'react';
import { TrendingUp, Sparkles, X, Plus } from 'lucide-react';
import { gsap } from 'gsap';

const SuggestedBooks = ({ suggestions, isVisible, onClose, onAddBook }) => {
  const tooltipRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (isVisible && tooltipRef.current) {
      gsap.fromTo(tooltipRef.current,
        { opacity: 0, y: 20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.7)" }
      );
    }
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % suggestions.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isVisible, suggestions.length]);

  const handleAddSuggestion = async () => {
    const suggestion = suggestions[currentIndex];
    const newBook = {
      title: suggestion.title,
      author: suggestion.author,
      cover: `https://images.pexels.com/photos/${Math.floor(Math.random() * 1000000)}/pexels-photo-${Math.floor(Math.random() * 1000000)}.jpeg?auto=compress&cs=tinysrgb&w=400`,
      pages: Math.floor(Math.random() * 400) + 200,
      genre: ['Fiction'], // Default genre
      status: 'wishlist',
      rating: 0,
      reactions: {},
      highlights: [],
      review: ''
    };
    
    try {
      await onAddBook(newBook);
      
      // Show success animation
      gsap.to(tooltipRef.current, {
        scale: 1.1,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: "power2.out"
      });
    } catch (err) {
      console.error('Failed to add suggested book:', err);
    }
  };

  if (!isVisible) return null;

  const currentSuggestion = suggestions[currentIndex];

  return (
    <div className="fixed bottom-8 right-8 z-40">
      <div
        ref={tooltipRef}
        className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/50 dark:to-pink-900/50 rounded-2xl p-6 shadow-2xl border border-purple-200 dark:border-purple-800 max-w-sm backdrop-blur-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <h3 className="font-bold text-gray-900 dark:text-white">Suggested for You</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
          >
            <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
            {currentSuggestion.title}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            by {currentSuggestion.author}
          </p>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              {currentSuggestion.match}% match
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex space-x-1">
            {suggestions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-purple-500' 
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-purple-300'
                }`}
              />
            ))}
          </div>
          <button 
            onClick={handleAddSuggestion}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Add to List</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuggestedBooks;