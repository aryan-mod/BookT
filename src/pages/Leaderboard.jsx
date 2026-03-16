import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, BookOpen, ArrowLeft, Crown } from 'lucide-react';
import api from '../api/axios';

const RANK_STYLES = [
  { icon: Crown, bg: 'bg-amber-400/20', text: 'text-amber-500', border: 'border-amber-400/40' },
  { icon: Medal, bg: 'bg-gray-200/40 dark:bg-gray-700/40', text: 'text-gray-400', border: 'border-gray-400/30' },
  { icon: Medal, bg: 'bg-orange-400/20', text: 'text-orange-400', border: 'border-orange-400/30' },
];

const BADGE_MAP = {
  first_book: '📖', five_books: '🐛', ten_books: '📚', streak_7: '🔥',
  streak_30: '⚡', hundred_pages: '📄', thousand_pages: '🏃',
};

function LeaderboardRow({ entry, index }) {
  const isTop3 = index < 3;
  const style = RANK_STYLES[index] || {};
  const Icon = style.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all hover:shadow-md ${
        isTop3
          ? `${style.bg} ${style.border} border`
          : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
      }`}
    >
      {/* Rank */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-lg ${isTop3 ? style.text : 'text-gray-400 dark:text-gray-500'}`}>
        {isTop3 && Icon ? <Icon className="w-6 h-6" /> : `#${entry.rank}`}
      </div>

      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
        {(entry.name || 'A')[0].toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{entry.name}</p>
        <div className="flex items-center gap-1 flex-wrap mt-0.5">
          {(entry.badges || []).slice(0, 4).map((b) => (
            <span key={b} title={b} className="text-xs">{BADGE_MAP[b] || '🏅'}</span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-5 text-right flex-shrink-0">
        <div>
          <p className="text-sm font-bold text-violet-600 dark:text-violet-400">{entry.completedBooks}</p>
          <p className="text-xs text-gray-400">Books</p>
        </div>
        {entry.coins > 0 && (
          <div>
            <p className="text-sm font-bold text-amber-500">{entry.coins}</p>
            <p className="text-xs text-gray-400">Coins</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/gamification/leaderboard', { params: { limit: 30 } })
      .then(({ data }) => setLeaderboard(data?.data?.leaderboard || []))
      .catch(() => setLeaderboard([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-violet-50/20 to-indigo-50/20 dark:from-gray-950 dark:via-violet-950/10 dark:to-indigo-950/10">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link to="/dashboard" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors font-medium mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reading Leaderboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Top readers ranked by books completed</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 animate-pulse" />
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No readers yet. Start reading to claim the top spot!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, i) => (
              <LeaderboardRow key={entry.userId} entry={entry} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
