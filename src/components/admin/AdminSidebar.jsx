import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Inbox,
  BookCheck,
  Users,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

const navItems = [
  { to: '/admin', end: true, icon: LayoutDashboard, label: 'Overview' },
  { to: '/admin/requests', end: false, icon: Inbox, label: 'Pending Requests' },
  { to: '/admin/books', end: false, icon: BookCheck, label: 'Approved Books' },
  { to: '/admin/users', end: false, icon: Users, label: 'Users' },
  { to: '/admin/analytics', end: false, icon: BarChart3, label: 'Analytics' },
];

export default function AdminSidebar({ collapsed, onToggle }) {
  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.2 }}
      className="fixed left-0 top-0 z-40 h-screen border-r border-gray-200/50 dark:border-gray-700/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-gray-900/80 flex flex-col"
    >
      <div className="flex h-16 items-center gap-2 border-b border-gray-200/50 dark:border-gray-700/50 px-4">
        <BookOpen className="h-8 w-8 shrink-0 text-blue-600 dark:text-blue-400" />
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="font-semibold text-gray-900 dark:text-white truncate"
          >
            Admin
          </motion.span>
        )}
      </div>
      <nav className="flex-1 space-y-0.5 p-2">
        {navItems.map((item, i) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-gray-200/50 dark:border-gray-700/50 p-2">
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </motion.aside>
  );
}
