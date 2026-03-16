import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } },
};

export default function AppLayout({ children, searchQuery, setSearchQuery }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const handleMenuOpen = useCallback(() => setMobileOpen(true), []);

  const sidebarW = collapsed ? 72 : 260;

  return (
    <div className="min-h-screen bg-nx-gradient flex">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main content area */}
      <div
        className="flex flex-col flex-1 min-h-screen transition-all duration-300"
        style={{ marginLeft: `${sidebarW}px` }}
      >
        <TopBar
          onMenuOpen={handleMenuOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Page content with route-based animation */}
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex-1 overflow-x-hidden"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}
