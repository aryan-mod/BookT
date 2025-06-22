import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const WordCloud = ({ books = [] }) => {
  const cloudRef = useRef(null);

  // Generate genre data from books
  const generateGenreData = () => {
    const genreCount = {};
    
    books.forEach(book => {
      book.genre.forEach(genre => {
        genreCount[genre] = (genreCount[genre] || 0) + 1;
      });
    });

    const colors = [
      'text-blue-500', 'text-purple-500', 'text-green-500', 'text-pink-500',
      'text-orange-500', 'text-teal-500', 'text-yellow-600', 'text-indigo-500',
      'text-red-500', 'text-cyan-500', 'text-gray-600', 'text-emerald-500'
    ];

    return Object.entries(genreCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 12)
      .map(([genre, count], index) => ({
        text: genre,
        size: Math.max(14, Math.min(32, 14 + count * 3)),
        color: colors[index % colors.length],
        count
      }));
  };

  const genreData = generateGenreData();

  useEffect(() => {
    if (genreData.length === 0) return;
    
    const words = cloudRef.current?.querySelectorAll('.word-item');
    if (!words) return;
    
    gsap.fromTo(words,
      { 
        opacity: 0, 
        scale: 0,
        rotation: () => gsap.utils.random(-180, 180)
      },
      { 
        opacity: 1, 
        scale: 1,
        rotation: 0,
        duration: 0.8,
        ease: "back.out(1.7)",
        stagger: 0.1
      }
    );

    // Floating animation
    words.forEach((word, index) => {
      gsap.to(word, {
        y: gsap.utils.random(-10, 10),
        x: gsap.utils.random(-5, 5),
        duration: gsap.utils.random(3, 5),
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1,
        delay: index * 0.2
      });
    });
  }, [genreData]);

  if (genreData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg dark:shadow-gray-900/20 transition-colors duration-300">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Your Reading Universe
        </h2>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Add some books to see your reading universe!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg dark:shadow-gray-900/20 transition-colors duration-300">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        Your Reading Universe
      </h2>
      
      <div 
        ref={cloudRef}
        className="relative h-64 flex flex-wrap items-center justify-center gap-2 overflow-hidden"
      >
        {genreData.map((genre, index) => (
          <span
            key={index}
            className={`word-item cursor-pointer hover:scale-110 transition-transform duration-200 font-semibold ${genre.color} dark:opacity-90 relative group`}
            style={{ fontSize: `${genre.size}px` }}
            title={`${genre.count} book${genre.count > 1 ? 's' : ''}`}
          >
            {genre.text}
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              {genre.count} book{genre.count > 1 ? 's' : ''}
            </span>
          </span>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Your most read genres • {books.length} total books
        </p>
      </div>
    </div>
  );
};

export default WordCloud;