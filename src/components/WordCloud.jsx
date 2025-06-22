import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const WordCloud = ({ genres }) => {
  const cloudRef = useRef(null);

  const genreData = [
    { text: 'Fiction', size: 28, color: 'text-blue-500' },
    { text: 'Philosophy', size: 20, color: 'text-purple-500' },
    { text: 'Self-Help', size: 24, color: 'text-green-500' },
    { text: 'Romance', size: 18, color: 'text-pink-500' },
    { text: 'Psychology', size: 22, color: 'text-orange-500' },
    { text: 'Contemporary', size: 16, color: 'text-teal-500' },
    { text: 'Historical', size: 20, color: 'text-yellow-600' },
    { text: 'Productivity', size: 14, color: 'text-indigo-500' },
    { text: 'Mystery', size: 18, color: 'text-red-500' },
    { text: 'Sci-Fi', size: 16, color: 'text-cyan-500' },
    { text: 'Biography', size: 15, color: 'text-gray-600' },
    { text: 'Adventure', size: 17, color: 'text-emerald-500' }
  ];

  useEffect(() => {
    const words = cloudRef.current.querySelectorAll('.word-item');
    
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
  }, []);

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
            className={`word-item cursor-pointer hover:scale-110 transition-transform duration-200 font-semibold ${genre.color} dark:opacity-90`}
            style={{ fontSize: `${genre.size}px` }}
          >
            {genre.text}
          </span>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Your most read genres this year
        </p>
      </div>
    </div>
  );
};

export default WordCloud;