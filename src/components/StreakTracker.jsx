import React from 'react';
import { Flame, Calendar, Trophy } from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function FireIcon({ active }) {
  return (
    <div className={`relative ${active ? 'animate-fire' : ''}`}>
      <Flame
        className={`w-6 h-6 transition-all duration-500 ${
          active
            ? 'text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)]'
            : 'text-slate-700'
        }`}
        fill={active ? 'rgba(251,146,60,0.8)' : 'transparent'}
      />
      {active && (
        <div className="absolute inset-0 blur-md opacity-50">
          <Flame className="w-6 h-6 text-amber-400" fill="rgba(245,158,11,0.8)" />
        </div>
      )}
    </div>
  );
}

export default function StreakTracker({ streakData = {} }) {
  const current = streakData.current || 0;
  const longest = streakData.longest || 0;
  const thisWeek = Array.isArray(streakData.thisWeek) && streakData.thisWeek.length === 7
    ? streakData.thisWeek
    : Array(7).fill(false);

  const isOnStreak = current > 0;
  const milestones = [7, 14, 30, 60, 100];
  const nextMilestone = milestones.find(m => m > current) || 365;
  const milestoneProgress = Math.min((current / nextMilestone) * 100, 100);

  return (
    <div className="glass-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl ${isOnStreak ? 'bg-orange-500/20' : 'bg-slate-800'}`}>
            <Flame className={`w-4 h-4 ${isOnStreak ? 'text-orange-400' : 'text-slate-500'}`} />
          </div>
          <span className="font-bold text-white text-sm">Daily Streak</span>
        </div>
        <div className="flex items-center gap-1">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs text-amber-400 font-semibold">Best: {longest}d</span>
        </div>
      </div>

      {/* Big streak number */}
      <div className="text-center mb-5">
        <div className="relative inline-block">
          {isOnStreak && (
            <div className="absolute -inset-4 rounded-full bg-orange-500/10 blur-xl animate-pulse-slow" />
          )}
          <div className="relative flex items-end justify-center gap-2">
            <FireIcon active={isOnStreak} />
            <span
              className="text-5xl font-extrabold leading-none"
              style={{
                background: isOnStreak
                  ? 'linear-gradient(135deg, #fb923c, #f59e0b)'
                  : 'rgba(255,255,255,0.15)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {current}
            </span>
            <FireIcon active={isOnStreak} />
          </div>
          <p className="text-slate-400 text-xs mt-1 font-medium">
            {isOnStreak ? 'day streak! 🔥 Keep it up!' : 'Start reading to build your streak'}
          </p>
        </div>
      </div>

      {/* Week calendar */}
      <div className="mb-5">
        <div className="flex items-center gap-1 mb-2">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs text-slate-500 font-medium">This week</span>
        </div>
        <div className="flex items-center justify-between gap-1">
          {DAYS.map((day, i) => {
            const active = thisWeek[i];
            return (
              <div key={day} className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    active
                      ? 'bg-gradient-to-br from-violet-600 to-violet-500 shadow-[0_0_12px_rgba(124,58,237,0.6)]'
                      : 'bg-white/4 border border-white/8'
                  }`}
                >
                  {active ? (
                    <Flame className="w-3.5 h-3.5 text-white" fill="rgba(255,255,255,0.8)" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                  )}
                </div>
                <span className="text-xs text-slate-600 font-medium">{day[0]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next milestone */}
      <div>
        <div className="flex justify-between mb-1.5">
          <span className="text-xs text-slate-500">Next milestone</span>
          <span className="text-xs text-violet-400 font-semibold">{nextMilestone} days</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${milestoneProgress}%` }} />
        </div>
        <p className="text-xs text-slate-600 mt-1">{nextMilestone - current} days to go</p>
      </div>
    </div>
  );
}