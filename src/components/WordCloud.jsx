import React, { useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';

const WordCloud = ({ books }) => {
  const cloudRef = useRef(null);

  const safeBooks = useMemo(() => (Array.isArray(books) ? books : []), [books]);

  const analytics = useMemo(() => {
    const genreCounts = new Map();
    const authorCounts = new Map();
    const categoryCounts = new Map();

    safeBooks.forEach((book) => {
      const genres = Array.isArray(book.genre ?? book.categories)
        ? book.genre ?? book.categories
        : [];
      genres.forEach((g) => {
        const key = typeof g === 'string' ? g.trim() : '';
        if (!key) return;
        genreCounts.set(key, (genreCounts.get(key) || 0) + 1);
        categoryCounts.set(key, (categoryCounts.get(key) || 0) + 1);
      });

      const author = typeof book.author === 'string' ? book.author.trim() : '';
      if (author) authorCounts.set(author, (authorCounts.get(author) || 0) + 1);
    });

    const topGenres = Array.from(genreCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    const favoriteAuthor = Array.from(authorCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0];

    const categoryTotal = Array.from(categoryCounts.values()).reduce(
      (sum, v) => sum + v,
      0
    );
    const booksPerCategory = Array.from(categoryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        count,
        pct: categoryTotal ? Math.round((count / categoryTotal) * 100) : 0,
      }));

    return { topGenres, favoriteAuthor, booksPerCategory };
  }, [safeBooks]);

  const generateGenreData = () => {
    const genreCount = {};

    safeBooks.forEach((book) => {
      const genres = Array.isArray(book.genre ?? book.categories)
        ? book.genre ?? book.categories
        : [];
      genres.forEach((g) => {
        const genre = typeof g === 'string' ? g.trim() : '';
        if (!genre) return;
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
          Your most read genres • {(Array.isArray(books) ? books.length : 0)} total books
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 p-3">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Top genres
          </div>
          <div className="text-sm text-gray-900 dark:text-gray-100 font-semibold">
            {analytics.topGenres.length
              ? analytics.topGenres.map((g) => g.name).join(', ')
              : '—'}
          </div>
        </div>

        <div className="rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 p-3">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Favorite author
          </div>
          <div className="text-sm text-gray-900 dark:text-gray-100 font-semibold truncate">
            {analytics.favoriteAuthor || '—'}
          </div>
        </div>

        <div className="rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 p-3">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            Books per category
          </div>
          {analytics.booksPerCategory.length ? (
            <div className="space-y-1.5">
              {analytics.booksPerCategory.slice(0, 3).map((c) => (
                <div key={c.name} className="flex items-center gap-2">
                  <div className="text-xs text-gray-700 dark:text-gray-300 truncate flex-1">
                    {c.name}
                  </div>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {c.pct}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-600 dark:text-gray-400">—</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WordCloud;