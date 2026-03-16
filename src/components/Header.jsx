import { useCallback, useEffect, useId, useRef, useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Bell, User, BookOpen, Plus, LogOut, Upload, ShoppingCart, Store, Trophy, X, Activity, Menu, Zap
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';
import { gsap } from 'gsap';
import { AuthContext } from '../context/AuthContext';

function NavItem({ to, icon: Icon, label, isActive }) {
  return (
    <Link to={to} className="relative px-3 py-1.5 group">
      <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
        isActive ? 'bg-white/10' : 'group-hover:bg-white/5 opacity-0 group-hover:opacity-100'
      }`} />
      <div className="relative flex items-center gap-1.5 whitespace-nowrap">
        <Icon className={`w-4 h-4 transition-colors duration-300 ${
          isActive ? 'text-violet-400' : 'text-slate-400 group-hover:text-slate-200'
        }`} />
        <span className={`text-sm font-medium transition-colors duration-300 ${
          isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'
        }`}>
          {label}
        </span>
      </div>
      {isActive && (
        <motion-underline /> // CSS powered via styled element below
      )}
    </Link>
  );
}

export default function Header({ searchQuery, setSearchQuery }) {
  const { user, logout } = useContext(AuthContext);
  const headerRef = useRef(null);
  const logoRef = useRef(null);
  const [openAdd, setOpenAdd] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { count: cartCount } = useCart() || {};
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications() || {};

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    const header = headerRef.current;
    const logo = logoRef.current;
    if (header && logo) {
      gsap.fromTo(header, { y: -100, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" });
      gsap.fromTo(logo, { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: 1, ease: "back.out(1.7)", delay: 0.2 });
    }
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.dropdown-container')) {
        setOpenAdd(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  return (
    <header 
      ref={headerRef}
      className="sticky top-0 z-[60]"
    >
      {/* Glassmorphic backdrop */}
      <div className="absolute inset-0 bg-[#080810]/70 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]" />
      
      {/* Animated gradient top line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 group mr-8">
            <div ref={logoRef} className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 shadow-glow-sm group-hover:shadow-[0_0_20px_rgba(124,58,237,0.6)] transition-all duration-300">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold font-display text-white tracking-tight hidden sm:block">
              Nexus<span className="text-violet-400">Read</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <NavItem to="/dashboard" icon={BookOpen} label="Library" isActive={location.pathname === '/dashboard'} />
            <NavItem to="/explore" icon={Search} label="Explore" isActive={location.pathname === '/explore'} />
            <NavItem to="/marketplace" icon={Store} label="Shop" isActive={location.pathname.startsWith('/marketplace')} />
            <NavItem to="/leaderboard" icon={Trophy} label="Rank" isActive={location.pathname === '/leaderboard'} />
            <NavItem to="/analytics" icon={Activity} label="Analytics" isActive={location.pathname === '/analytics'} />
            {String(user?.role).toLowerCase() === 'admin' && (
              <NavItem to="/admin" icon={Zap} label="Admin" isActive={location.pathname.startsWith('/admin')} />
            )}
          </nav>

          {/* Search Bar */}
          <div className="flex-1 max-w-sm mx-4 hidden sm:block">
            <div className="relative group/search">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400 group-focus-within/search:text-violet-400 transition-colors" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500/50 focus:bg-white/10 transition-all duration-300"
                placeholder="Search books, authors..."
              />
              <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                <kbd className="hidden lg:inline-flex items-center gap-1 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">⌘K</kbd>
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 lg:gap-3">
            
            {/* Add Dropdown */}
            <div className="relative dropdown-container hidden sm:block">
              <button
                onClick={(e) => { e.stopPropagation(); setOpenAdd(!openAdd); setNotifOpen(false); }}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-violet-600 hover:bg-violet-500 text-white shadow-glow-sm hover:shadow-[0_0_15px_rgba(124,58,237,0.7)] hover:scale-105 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
              </button>
              
              {openAdd && (
                <div className="absolute right-0 mt-3 w-48 glass-card border border-white/10 shadow-2xl py-1 z-50 animate-fade-in">
                  <Link to="/explore" onClick={() => setOpenAdd(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                    <Search className="w-4 h-4 text-violet-400" /> Search Online
                  </Link>
                  <Link to="/upload" onClick={() => setOpenAdd(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                    <Upload className="w-4 h-4 text-cyan-400" /> Upload PDF
                  </Link>
                </div>
              )}
            </div>

            {/* Cart */}
            <button onClick={() => navigate('/cart')} className="relative p-2 rounded-full text-slate-300 hover:bg-white/10 hover:text-white transition-all">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-violet-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(124,58,237,0.8)] border border-[#080810]">{cartCount}</span>
              )}
            </button>

            {/* Notifications */}
            <div className="relative dropdown-container">
              <button onClick={(e) => { e.stopPropagation(); setNotifOpen(!notifOpen); setOpenAdd(false); }} className="relative p-2 rounded-full text-slate-300 hover:bg-white/10 hover:text-white transition-all">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(239,68,68,0.8)] border border-[#080810]">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>
              
              {notifOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 glass-card border border-white/10 shadow-2xl z-50 overflow-hidden animate-slide-in-up">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5">
                    <span className="font-semibold text-white text-sm">Notifications</span>
                    <div className="flex items-center gap-3">
                      {unreadCount > 0 && <button onClick={markAllRead} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">Mark all read</button>}
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto no-scrollbar">
                    {(notifications || []).length === 0 ? (
                      <div className="py-8 text-center flex flex-col items-center">
                        <Bell className="w-8 h-8 text-slate-600 mb-2 opacity-30" />
                        <p className="text-xs text-slate-500">All caught up!</p>
                      </div>
                    ) : (notifications || []).map((n) => (
                      <div key={n._id} onClick={() => markRead(n._id)}
                        className={`flex gap-3 px-4 py-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${!n.isRead ? 'bg-violet-500/10' : ''}`}>
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm">{n.icon || '🔔'}</div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs ${n.isRead ? 'text-slate-300' : 'text-white font-semibold'}`}>{n.title}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{n.message}</p>
                        </div>
                        {!n.isRead && <div className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0 mt-1.5 shadow-[0_0_6px_rgba(167,139,250,0.8)]" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* User Menu */}
            {user ? (
              <div className="flex items-center gap-1 ml-1 pl-3 border-l border-white/10">
                <Link to="/profile" className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-white/5 transition-colors group">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-600 to-cyan-500 p-0.5">
                    <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=15152a&color=fff`} alt={user.name} className="w-full h-full rounded-full object-cover border border-[#080810]" />
                  </div>
                  <span className="hidden sm:block text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">{user.name?.split(' ')[0]}</span>
                </Link>
                <button onClick={handleLogout} className="p-2 rounded-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Logout">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="ml-2 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-colors">
                Log In
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden ml-1 p-2 rounded-full text-slate-300 hover:bg-white/10">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden glass border-t border-white/10 animate-fade-in absolute w-full inset-x-0 mt-px shadow-2xl">
          <div className="px-4 py-3 space-y-1 bg-[#080810]/95 backdrop-blur-xl">
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white"><BookOpen className="w-5 h-5" /> Library</Link>
            <Link to="/explore" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white"><Search className="w-5 h-5" /> Explore</Link>
            <Link to="/marketplace" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white"><Store className="w-5 h-5" /> Shop</Link>
            <Link to="/leaderboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white"><Trophy className="w-5 h-5" /> Rank</Link>
            <Link to="/analytics" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white"><Activity className="w-5 h-5" /> Analytics</Link>
            {String(user?.role).toLowerCase() === 'admin' && (
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white"><Zap className="w-5 h-5" /> Admin Dashboard</Link>
            )}
            <div className="h-px bg-white/10 my-2" />
            <Link to="/upload" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-violet-400 bg-violet-500/10 font-medium"><Upload className="w-5 h-5" /> Upload PDF</Link>
          </div>
        </div>
      )}

      {/* Global styling for active nav underline */}
      <style dangerouslySetInnerHTML={{__html: `
        motion-underline {
          position: absolute;
          bottom: -22px;
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
          height: 3px;
          background: linear-gradient(90deg, #7c3aed, #06b6d4);
          border-radius: 3px 3px 0 0;
          box-shadow: 0 -2px 10px rgba(124,58,237,0.8);
          animation: slide-up 0.3s ease-out forwards;
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translate(-50%, 5px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}} />
    </header>
  );
}