import React, { useEffect, useRef } from 'react';
import { Flame, Calendar, Trophy, Target } from 'lucide-react';
import { gsap } from 'gsap';

const StreakTracker = ({ streakData }) => {
  const containerRef = useRef(null);
  const flameRef = useRef(null);
  const statsRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const flame = flameRef.current;
    const stats = statsRef.current;

    gsap.fromTo(container,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    );

    gsap.fromTo(flame,
      { scale: 0, rotation: -180 },
      { scale: 1, rotation: 0, duration: 1.2, ease: "back.out(1.7)", delay: 0.2 }
    );

    gsap.fromTo(stats,
      { x: -30, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, stagger: 0.1, delay: 0.4 }
    );

    // Flame animation
    gsap.to(flame, {
      y: -5,
      duration: 2,
      ease: "power2.inOut",
      yoyo: true,
      repeat: -1
    });
  }, []);

  const getDayStatus = (index) => {
    return streakData.thisWeek[index] ? 'completed' : 'missed';
  };

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div ref={containerRef} className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-6 border border-orange-200 dark:border-orange-800 transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <div ref={flameRef}>
            <Flame className="h-6 w-6 text-orange-500 mr-2" />
          </div>
          Reading Streak
        </h2>
        <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
          {streakData.current}
          <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-1">days</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-6">
        {days.map((day, index) => (
          <div key={index} className="text-center">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {day}
            </div>
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                getDayStatus(index) === 'completed'
                  ? 'bg-green-500 text-white shadow-lg' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
              }`}
            >
              {getDayStatus(index) === 'completed' && (
                <div className="w-2 h-2 bg-white rounded-full"></div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div ref={statsRef} className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-white/80 dark:border-gray-700/80">
          <Trophy className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
          <div className="text-lg font-bold text-gray-900 dark:text-white">{streakData.longest}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Best Streak</div>
        </div>
        <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-white/80 dark:border-gray-700/80">
          <Calendar className="h-5 w-5 text-blue-500 mx-auto mb-1" />
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {streakData.thisWeek.filter(Boolean).length}/7
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">This Week</div>
        </div>
        <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-white/80 dark:border-gray-700/80">
          <Target className="h-5 w-5 text-purple-500 mx-auto mb-1" />
          <div className="text-lg font-bold text-gray-900 dark:text-white">85%</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Goal Rate</div>
        </div>
      </div>
    </div>
  );
};

export default StreakTracker;