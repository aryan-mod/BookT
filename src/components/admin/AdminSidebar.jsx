import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useContext } from 'react';
import {
  LayoutDashboard, Inbox, BookCheck, Users, BarChart3,
  ChevronLeft, ChevronRight, BookOpen, LogOut
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const navItems = [
  { to: '/admin',           end: true,  icon: LayoutDashboard, label: 'Overview' },
  { to: '/admin/requests',  end: false, icon: Inbox,           label: 'Pending Requests' },
  { to: '/admin/books',     end: false, icon: BookCheck,       label: 'Approved Books' },
  { to: '/admin/users',     end: false, icon: Users,           label: 'Users' },
  { to: '/admin/analytics', end: false, icon: BarChart3,       label: 'Analytics' },
];

export default function AdminSidebar({ collapsed, onToggle }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const avatarUrl = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'A')}&background=15152a&color=a78bfa&bold=true`;

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 z-50 h-screen flex flex-col bg-[#090914] border-r border-white/[0.06] overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 h-[60px] px-4 border-b border-white/[0.05] flex-shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(124,58,237,0.4)]">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <AnimatePresence mode="wait" initial={false}>
          {!collapsed && (
            <motion.div key="logo" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.18 }}>
              <span className="text-sm font-bold text-white whitespace-nowrap">NexusRead <span className="text-violet-400 text-xs font-semibold uppercase tracking-wider">Admin</span></span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto no-scrollbar">
        <AnimatePresence mode="wait" initial={false}>
          {!collapsed && (
            <motion.p key="label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-[10px] font-bold uppercase tracking-widest text-violet-600/60 px-3 mb-2">
              Management
            </motion.p>
          )}
        </AnimatePresence>
        {navItems.map(({ to, end, icon: Icon, label }) => (
          <NavLink
            key={to} to={to} end={end}
            title={collapsed ? label : undefined}
            className={({ isActive }) => `
              relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              transition-all group
              ${isActive ? 'nav-item-active' : 'nav-item-hover text-slate-500'}
            `}
          >
            <Icon className="w-4.5 h-4.5 flex-shrink-0 w-[18px] h-[18px]" />
            <AnimatePresence mode="wait" initial={false}>
              {!collapsed && (
                <motion.span key={label} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }} transition={{ duration: 0.15 }} className="whitespace-nowrap">
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
            {/* Tooltip */}
            {collapsed && (
              <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-[#12122a] border border-white/10 text-white text-xs font-medium shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                {label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/[0.05] p-3 flex-shrink-0 space-y-1">
        {user && (
          <div className="flex items-center gap-2.5 mb-2">
            <img src={avatarUrl} alt="" className="w-7 h-7 rounded-full ring-2 ring-violet-500/30 flex-shrink-0" />
            <AnimatePresence mode="wait" initial={false}>
              {!collapsed && (
                <motion.p key="uname" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-slate-400 font-medium truncate">
                  {user.name}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        )}
        <button onClick={onToggle}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-600 hover:text-slate-300 hover:bg-white/[0.04] transition-colors">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>}
        </button>
        <button onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors">
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
}
