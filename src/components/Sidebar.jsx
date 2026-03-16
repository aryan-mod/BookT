import { useState, useContext, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Compass, Store, BarChart2, Trophy, User, Upload,
  Zap, LogOut, ChevronLeft, ChevronRight, Menu, X,
  Library, ShoppingCart, Bell
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { to: '/dashboard', icon: Library,   label: 'Library' },
      { to: '/explore',   icon: Compass,   label: 'Explore' },
      { to: '/marketplace', icon: Store,   label: 'Marketplace' },
    ],
  },
  {
    label: 'Personal',
    items: [
      { to: '/analytics',   icon: BarChart2, label: 'Analytics' },
      { to: '/leaderboard', icon: Trophy,    label: 'Leaderboard' },
      { to: '/profile',     icon: User,      label: 'Profile' },
    ],
  },
  {
    label: 'Actions',
    items: [
      { to: '/upload', icon: Upload, label: 'Upload PDF' },
    ],
  },
];

function NavItem({ to, icon: Icon, label, collapsed, isActive }) {
  return (
    <Link
      to={to}
      title={collapsed ? label : undefined}
      className={`
        relative flex items-center gap-3 px-3 py-2.5 rounded-xl
        transition-all duration-200 group
        ${isActive ? 'nav-item-active' : 'nav-item-hover text-slate-400'}
      `}
    >
      {/* Active glow dot */}
      {isActive && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.9)]" />
      )}

      <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-300'}`} />

      <AnimatePresence mode="wait" initial={false}>
        {!collapsed && (
          <motion.span
            key="label"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18 }}
            className="text-sm font-medium whitespace-nowrap"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Tooltip for collapsed */}
      {collapsed && (
        <div className="
          absolute left-full ml-3 px-2.5 py-1.5 rounded-lg
          bg-[#12122a] border border-white/10 text-white text-xs font-medium
          shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none
          transition-opacity duration-150 whitespace-nowrap z-50
        ">
          {label}
        </div>
      )}
    </Link>
  );
}

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { count: cartCount } = useCart() || {};

  const isAdmin = String(user?.role).toLowerCase() === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const avatarUrl = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=15152a&color=a78bfa&bold=true`;

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={`
          nx-sidebar fixed top-0 left-0 h-screen z-50
          flex flex-col
          bg-[#090914] border-r border-white/[0.06]
          ${mobileOpen ? 'mobile-open translate-x-0' : ''}
        `}
        style={{ overflow: 'hidden' }}
      >
        {/* ── Logo ── */}
        <div className="flex items-center gap-3 px-4 h-[60px] border-b border-white/[0.05] flex-shrink-0">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(124,58,237,0.4)] group-hover:shadow-[0_0_25px_rgba(124,58,237,0.6)] transition-shadow">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <AnimatePresence mode="wait" initial={false}>
              {!collapsed && (
                <motion.div
                  key="logotext"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.18 }}
                >
                  <span className="text-lg font-bold text-white tracking-tight whitespace-nowrap">
                    Nexus<span className="text-violet-400">Read</span>
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>

          {/* Collapse toggle — desktop */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto hidden md:flex items-center justify-center w-6 h-6 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors flex-shrink-0"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          {/* Close — mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto flex md:hidden items-center justify-center w-6 h-6 rounded-lg text-slate-500 hover:text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 space-y-1 no-scrollbar">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="mb-4">
              <AnimatePresence mode="wait" initial={false}>
                {!collapsed && (
                  <motion.p
                    key={section.label}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-[10px] font-bold uppercase tracking-widest text-slate-600 px-3 mb-1.5"
                  >
                    {section.label}
                  </motion.p>
                )}
              </AnimatePresence>
              {section.items.map((item) => (
                <NavItem
                  key={item.to}
                  {...item}
                  collapsed={collapsed}
                  isActive={
                    item.to === '/dashboard'
                      ? location.pathname === '/dashboard'
                      : location.pathname.startsWith(item.to)
                  }
                />
              ))}
            </div>
          ))}

          {/* Admin section */}
          {isAdmin && (
            <div className="mb-4">
              <AnimatePresence mode="wait" initial={false}>
                {!collapsed && (
                  <motion.p
                    key="admin-label"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-[10px] font-bold uppercase tracking-widest text-violet-600/70 px-3 mb-1.5"
                  >
                    Admin
                  </motion.p>
                )}
              </AnimatePresence>
              <NavItem
                to="/admin"
                icon={Zap}
                label="Admin Panel"
                collapsed={collapsed}
                isActive={location.pathname.startsWith('/admin')}
              />
            </div>
          )}
        </nav>

        {/* ── Cart quick-link ── */}
        <div className="px-2 pb-2">
          <Link
            to="/cart"
            className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl nav-item-hover text-slate-400 group"
          >
            <ShoppingCart className="w-5 h-5 flex-shrink-0 text-slate-500 group-hover:text-slate-300" />
            {!collapsed && (
              <span className="text-sm font-medium">Cart</span>
            )}
            {cartCount > 0 && (
              <span className="absolute top-1.5 left-6 w-4 h-4 bg-violet-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* ── User Footer ── */}
        <div className="border-t border-white/[0.05] p-3 flex-shrink-0">
          {user ? (
            <div className="flex items-center gap-2.5">
              <Link to="/profile" className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full ring-2 ring-violet-500/40 overflow-hidden">
                  <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                </div>
              </Link>
              <AnimatePresence mode="wait" initial={false}>
                {!collapsed && (
                  <motion.div
                    key="user-info"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.18 }}
                    className="flex-1 min-w-0"
                  >
                    <p className="text-sm font-semibold text-white truncate leading-tight">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate capitalize">{user.role || 'reader'}</p>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence mode="wait" initial={false}>
                {!collapsed && (
                  <motion.button
                    key="logout-btn"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleLogout}
                    title="Logout"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
                  >
                    <LogOut className="w-4 h-4" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/login" className="flex items-center justify-center w-full px-3 py-2 rounded-xl bg-violet-600/20 text-violet-400 text-sm font-medium hover:bg-violet-600/30 transition-colors">
              {collapsed ? <User className="w-4 h-4" /> : 'Sign In'}
            </Link>
          )}
        </div>
      </motion.aside>
    </>
  );
}
