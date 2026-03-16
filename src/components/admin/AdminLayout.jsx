import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar from './AdminSidebar';

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28 } },
  exit:    { opacity: 0,     transition: { duration: 0.18 } },
};

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const sidebarW = collapsed ? 72 : 240;

  return (
    <div className="min-h-screen bg-nx-gradient flex">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />

      <div
        className="flex flex-col flex-1 min-h-screen transition-all duration-300"
        style={{ marginLeft: sidebarW }}
      >
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex-1 p-5 sm:p-7"
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}
