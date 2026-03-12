import React, { useEffect, useRef } from 'react';
import { BookOpen, Clock, Target, TrendingUp, Award, Calendar } from 'lucide-react';
import { gsap } from 'gsap';

const formatMinutes = (totalMinutes) => {
  const minutes = Number.isFinite(totalMinutes) ? Math.max(0, Math.round(totalMinutes)) : 0;
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return remHours ? `${days}d ${remHours}h` : `${days}d`;
  }
  return mins ? `${hours}h ${mins}m` : `${hours}h`;
};

const StatsPanel = ({ books, analytics }) => {
  const panelRef = useRef(null);
  const statsRef = useRef(null);

  const completedBooksLocal = books.filter(book => book.status === 'completed');
  const totalPagesLocal = completedBooksLocal.reduce((sum, book) => sum + (book.pages || 0), 0);
  const averageRatingLocal =
    completedBooksLocal.reduce((sum, book) => sum + (book.rating || 0), 0) /
      (completedBooksLocal.length || 1) || 0;
  const currentlyReadingLocal = books.filter(book => book.status === 'reading').length;

  const totalBooksRead = analytics?.totalBooksRead ?? completedBooksLocal.length;
  const totalPages = analytics?.pagesRead ?? totalPagesLocal;
  const averageRating =
    typeof analytics?.averageRating === 'number'
      ? analytics.averageRating
      : averageRatingLocal;
  const currentlyReading = analytics?.currentlyReadingCount ?? currentlyReadingLocal;
  const booksCompletedThisMonth = analytics?.booksCompletedThisMonth ?? 0;
  const readingTimeLabel = formatMinutes(analytics?.totalReadingMinutes);

  const stats = [
    { 
      icon: BookOpen, 
      label: 'Books Read', 
      value: totalBooksRead, 
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20' 
    },
    { 
      icon: Calendar, 
      label: 'Pages Read', 
      value: totalPages.toLocaleString(), 
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20' 
    },
    { 
      icon: TrendingUp, 
      label: 'Avg Rating', 
      value: averageRating.toFixed(1), 
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' 
    },
    { 
      icon: Target, 
      label: 'Currently Reading', 
      value: currentlyReading, 
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20' 
    },
    { 
      icon: Award, 
      label: 'This Month', 
      value: booksCompletedThisMonth, 
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20' 
    },
    { 
      icon: Clock, 
      label: 'Reading Time', 
      value: readingTimeLabel, 
      color: 'text-teal-500',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20' 
    }
  ];

  useEffect(() => {
    const panel = panelRef.current;
    const statItems = statsRef.current.querySelectorAll('.stat-item');

    gsap.fromTo(panel,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    );

    gsap.fromTo(statItems,
      { y: 30, opacity: 0, scale: 0.9 },
      { 
        y: 0, 
        opacity: 1, 
        scale: 1, 
        duration: 0.6, 
        ease: "back.out(1.7)", 
        stagger: 0.1,
        delay: 0.2
      }
    );
  }, []);

  return (
    <div ref={panelRef} className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Your Reading Stats
      </h2>
      
      <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`stat-item ${stat.bgColor} rounded-2xl p-4 text-center hover:scale-105 transition-all duration-300 cursor-pointer border border-white/20 dark:border-gray-700/20`}
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 ${stat.color} mb-3 mx-auto`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatsPanel;