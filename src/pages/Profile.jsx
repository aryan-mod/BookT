import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, Star, Trophy, Users, Calendar, ArrowLeft,
  Globe, Lock, UserPlus, UserMinus, Award
} from 'lucide-react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const BADGE_MAP = {
  first_book: { icon: '📖', name: 'First Chapter' },
  five_books: { icon: '🐛', name: 'Bookworm' },
  ten_books: { icon: '📚', name: 'Bibliophile' },
  streak_7: { icon: '🔥', name: 'Week Warrior' },
  streak_30: { icon: '⚡', name: 'Monthly Legend' },
  hundred_pages: { icon: '📄', name: 'Page Turner' },
  thousand_pages: { icon: '🏃', name: 'Marathon Reader' },
};

function StatCard({ icon: Icon, label, value, color = 'violet' }) {
  const colors = {
    violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
  };
  return (
    <div className={`${colors[color]} rounded-2xl p-4 text-center`}>
      <Icon className="w-5 h-5 mx-auto mb-1" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs opacity-75 mt-0.5">{label}</p>
    </div>
  );
}

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: me } = useContext(AuthContext);

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({});
  const [recentBooks, setRecentBooks] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [error, setError] = useState('');

  // My own profile data
  const [myBadges, setMyBadges] = useState([]);
  const [myCoins, setMyCoins] = useState(0);
  const isMyProfile = me && (!userId || String(userId) === String(me._id));

  useEffect(() => {
    const id = userId || me?._id;
    if (!id) return;

    setLoading(true);
    if (isMyProfile) {
      // Load my own data using gamification endpoint
      Promise.all([
        api.get('/gamification/badges'),
        api.get('/reader/progress').catch(() => ({ data: { data: [] } })),
      ]).then(([badgesRes]) => {
        setMyBadges(badgesRes?.data?.data?.earned || []);
        setMyCoins(badgesRes?.data?.data?.coins || 0);
        setProfile({ name: me.name, avatar: me.avatar, bio: me.bio });
        setLoading(false);
      }).catch(() => { setError('Could not load your profile.'); setLoading(false); });
    } else {
      api.get(`/social/profile/${id}`)
        .then(({ data }) => {
          setProfile(data?.data?.profile || null);
          setStats(data?.data?.stats || {});
          setRecentBooks(data?.data?.recentBooks || []);
          setIsFollowing(data?.data?.isFollowing || false);
        })
        .catch((err) => {
          setError(err?.response?.data?.message || 'Profile not found.');
        })
        .finally(() => setLoading(false));
    }
  }, [userId, me, isMyProfile]);

  const handleFollow = async () => {
    if (!me) { navigate('/login'); return; }
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await api.delete(`/social/follow/${userId}`);
        setIsFollowing(false);
        setProfile((p) => ({ ...p, followersCount: (p.followersCount || 1) - 1 }));
      } else {
        await api.post(`/social/follow/${userId}`);
        setIsFollowing(true);
        setProfile((p) => ({ ...p, followersCount: (p.followersCount || 0) + 1 }));
      }
    } catch {}
    setFollowLoading(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="animate-spin w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-950">
      <Lock className="w-12 h-12 text-gray-400" />
      <p className="text-gray-500 dark:text-gray-400">{error}</p>
      <button onClick={() => navigate(-1)} className="text-violet-600 hover:underline font-medium">← Go back</button>
    </div>
  );

  const badges = isMyProfile ? myBadges : (profile?.badges || []);
  const coins = isMyProfile ? myCoins : (profile?.coins || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-violet-50/20 to-indigo-50/20 dark:from-gray-950 dark:via-violet-950/10 dark:to-indigo-950/10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors font-medium mb-8">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Profile header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden mb-6 shadow-sm">
          {/* Banner */}
          <div className="h-28 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-600" />
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-12 mb-4">
              <div className="w-20 h-20 rounded-2xl bg-white dark:bg-gray-700 ring-4 ring-white dark:ring-gray-800 flex items-center justify-center text-3xl font-bold text-violet-600 shadow-lg">
                {profile?.avatar
                  ? <img src={profile.avatar} alt="" className="w-full h-full object-cover rounded-2xl" />
                  : (profile?.name || 'A')[0].toUpperCase()}
              </div>
              <div className="flex gap-2 pt-12">
                {isMyProfile ? (
                  <Link to="/dashboard" className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Dashboard
                  </Link>
                ) : (
                  <button onClick={handleFollow} disabled={followLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isFollowing
                        ? 'border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500'
                        : 'bg-violet-600 hover:bg-violet-700 text-white'
                    }`}>
                    {isFollowing ? <><UserMinus className="w-4 h-4" /> Unfollow</> : <><UserPlus className="w-4 h-4" /> Follow</>}
                  </button>
                )}
              </div>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{profile?.name}</h1>
            {profile?.bio && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{profile.bio}</p>}
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
              {!isMyProfile && (
                <>
                  <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {profile?.followersCount || 0} followers</span>
                  <span>{profile?.followingCount || 0} following</span>
                </>
              )}
              {profile?.memberSince && (
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Joined {new Date(profile.memberSince).toLocaleDateString('en', { month: 'short', year: 'numeric' })}</span>
              )}
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400"><Award className="w-4 h-4" /> {coins} coins</span>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        {!isMyProfile && (stats.completedBooks !== undefined) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-4 mb-6">
            <StatCard icon={BookOpen} label="Books Read" value={stats.completedBooks || 0} color="violet" />
            <StatCard icon={Trophy} label="Badges" value={badges.length} color="amber" />
            <StatCard icon={Star} label="Reading Now" value={stats.currentlyReading || 0} color="emerald" />
          </motion.div>
        )}

        {/* Badges */}
        {badges.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 mb-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Badges Earned</h3>
            <div className="flex flex-wrap gap-2">
              {badges.map((b) => (
                <div key={b} title={BADGE_MAP[b]?.name || b}
                  className="flex items-center gap-2 bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800 px-3 py-1.5 rounded-full text-sm font-medium text-violet-700 dark:text-violet-300">
                  <span>{BADGE_MAP[b]?.icon || '🏅'}</span>
                  <span>{BADGE_MAP[b]?.name || b}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent reads */}
        {recentBooks.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Recently Read</h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {recentBooks.slice(0, 6).map((book) => (
                book && (
                  <Link key={book._id} to={`/marketplace/${book._id}`}
                    className="group text-center">
                    <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-950 dark:to-indigo-950 mb-1">
                      {book.cover ? <img src={book.cover} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-5 h-5 text-violet-300 dark:text-violet-700" /></div>}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-tight">{book.title}</p>
                  </Link>
                )
              ))}
            </div>
          </motion.div>
        )}

        {isMyProfile && badges.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 text-center">
            <Trophy className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">Complete books to earn your first badge!</p>
            <Link to="/dashboard" className="mt-3 inline-block px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold">Go to Library</Link>
          </div>
        )}
      </div>
    </div>
  );
}
