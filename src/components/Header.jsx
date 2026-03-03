import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Bell,
  User,
  Moon,
  Sun,
  BookOpen,
  Plus,
  LogOut,
  ChevronDown,
  Upload,
} from 'lucide-react';
import { gsap } from 'gsap';

const Header = ({
  theme,
  toggleTheme,
  searchQuery,
  setSearchQuery,
  onAddBook, // kept for backward compatibility
  user,
  onLogout,
}) => {
  const headerRef = useRef(null);
  const logoRef = useRef(null);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const firstItemRef = useRef(null);
  const [open, setOpen] = useState(false);
  const menuId = useId();

  const closeMenu = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const header = headerRef.current;
    const logo = logoRef.current;

    gsap.fromTo(header, 
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    );

    gsap.fromTo(logo,
      { scale: 0, rotation: -180 },
      { scale: 1, rotation: 0, duration: 1, ease: "back.out(1.7)", delay: 0.3 }
    );
  }, []);

  useEffect(() => {
    function onDocMouseDown(e) {
      if (!open) return;
      const target = e.target;
      if (menuRef.current && menuRef.current.contains(target)) return;
      if (buttonRef.current && buttonRef.current.contains(target)) return;
      setOpen(false);
    }

    function onDocKeyDown(e) {
      if (!open) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        buttonRef.current?.focus?.();
      }
    }

    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onDocKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onDocKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => firstItemRef.current?.focus?.(), 0);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [open]);

  const toggleMenu = useCallback(() => setOpen((v) => !v), []);

  const onAddButtonKeyDown = useCallback(
    (e) => {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setOpen(true);
      }
    },
    []
  );

  return (
    <header 
      ref={headerRef}
      className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-6">
            <Link to="/dashboard" ref={logoRef} className="flex items-center space-x-2 cursor-pointer group">
              <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                BookTracker
              </span>
            </Link>
            <Link
              to="/explore"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            >
              Explore
            </Link>
            {String(user?.role).toLowerCase() === 'admin' && (
              <Link
                to="/admin"
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              >
                Admin
              </Link>
            )}
          </div>

          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Search books, authors, or genres..."
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                ref={buttonRef}
                type="button"
                onClick={toggleMenu}
                onKeyDown={onAddButtonKeyDown}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls={menuId}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 hover:scale-105 font-medium shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Book</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                />
              </button>

              {open ? (
                <div
                  id={menuId}
                  ref={menuRef}
                  role="menu"
                  className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg dark:shadow-gray-950/50 p-1 z-[60]"
                >
                  <Link
                    ref={firstItemRef}
                    to="/explore"
                    role="menuitem"
                    tabIndex={0}
                    onClick={closeMenu}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Search className="h-4 w-4" />
                    Search Books
                  </Link>
                  <Link
                    to="/upload"
                    role="menuitem"
                    tabIndex={0}
                    onClick={closeMenu}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    Upload PDF
                  </Link>
                </div>
              ) : null}
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            
            <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
            </button>
            
            {user ? (
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <span className="hidden sm:inline text-sm font-medium">{user.name}</span>
                <LogOut className="h-5 w-5" />
              </button>
            ) : (
              <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110">
                <User className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;