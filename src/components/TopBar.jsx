import { useState, useContext, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Bell, Menu, X, Plus, Upload, Compass
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { gsap } from 'gsap';

export default function TopBar({ onMenuOpen, searchQuery, setSearchQuery }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications() || {};
  const [notifOpen, setNotifOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const barRef = useRef(null);

  // Animate in on mount
  useEffect(() => {
    if (barRef.current) {
      gsap.fromTo(barRef.current, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' });
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('.dd-container')) {
        setNotifOpen(false);
        setAddOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Page title mapping
  const pageTitles = {
    '/dashboard': 'My Library',
    '/explore': 'Explore',
    '/marketplace': 'Marketplace',
    '/analytics': 'Analytics',
    '/leaderboard': 'Leaderboard',
    '/profile': 'Profile',
    '/upload': 'Upload PDF',
    '/cart': 'Cart',
    '/admin': 'Admin',
  };
  const pageTitle = pageTitles[location.pathname] ??
    (location.pathname.startsWith('/admin') ? 'Admin' :
     location.pathname.startsWith('/reader') ? 'Reader' :
     location.pathname.startsWith('/marketplace') ? 'Book Detail' : '');

  return (
    <header
      ref={barRef}
      className="sticky top-0 z-40 h-[60px] flex-shrink-0"
    >
      {/* Glass backdrop */}
      <div className="absolute inset-0 bg-[#060611]/80 backdrop-blur-xl border-b border-white/[0.05]" />
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

      <div className="relative h-full flex items-center gap-3 px-4">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuOpen}
          className="md:hidden flex items-center justify-center w-8 h-8 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page Title */}
        <AnimatePresence mode="wait">
          <motion.h1
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="text-base font-bold text-white hidden sm:block"
          >
            {pageTitle}
          </motion.h1>
        </AnimatePresence>

        {/* Search */}
        <div className="flex-1 max-w-sm mx-auto sm:mx-4">
          <div className="relative group/search">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within/search:text-violet-400 transition-colors" />
            <input
              type="text"
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery?.(e.target.value)}
              placeholder="Search books, authors…"
              className="w-full pl-9 pr-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-full text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-500/40 focus:border-violet-500/40 focus:bg-white/[0.07] transition-all duration-300"
            />
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 ml-auto">
          {/* Add button */}
          <div className="relative dd-container">
            <button
              onClick={(e) => { e.stopPropagation(); setAddOpen(!addOpen); setNotifOpen(false); }}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_12px_rgba(124,58,237,0.4)] hover:shadow-[0_0_20px_rgba(124,58,237,0.65)] hover:scale-105 transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {addOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-44 glass-card border border-white/10 shadow-2xl py-1 z-50"
                >
                  <Link to="/explore" onClick={() => setAddOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                    <Compass className="w-4 h-4 text-violet-400" /> Search Online
                  </Link>
                  <Link to="/upload" onClick={() => setAddOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                    <Upload className="w-4 h-4 text-cyan-400" /> Upload PDF
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notifications */}
          <div className="relative dd-container">
            <button
              onClick={(e) => { e.stopPropagation(); setNotifOpen(!notifOpen); setAddOpen(false); }}
              className="relative flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <Bell className="w-4.5 h-4.5 w-[18px] h-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 glass-card border border-white/10 shadow-2xl z-50 overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.03]">
                    <span className="font-semibold text-white text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto no-scrollbar">
                    {!(notifications?.length) ? (
                      <div className="py-8 text-center flex flex-col items-center">
                        <Bell className="w-7 h-7 text-slate-700 mb-2" />
                        <p className="text-xs text-slate-600">All caught up!</p>
                      </div>
                    ) : notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => markRead(n._id)}
                        className={`flex gap-3 px-4 py-3 border-b border-white/[0.04] cursor-pointer hover:bg-white/[0.03] transition-colors ${!n.isRead ? 'bg-violet-500/[0.08]' : ''}`}
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm">
                          {n.icon || '🔔'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs ${n.isRead ? 'text-slate-300' : 'text-white font-semibold'}`}>{n.title}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{n.message}</p>
                        </div>
                        {!n.isRead && <div className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0 mt-1.5 shadow-[0_0_6px_rgba(167,139,250,0.9)]" />}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
