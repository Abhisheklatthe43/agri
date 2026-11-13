import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-surface-bg">
      <Navbar
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        isSidebarOpen={sidebarOpen}
      />

      <div className="flex flex-1">
        <Sidebar
          isOpen={sidebarOpen}
          closeSidebar={() => setSidebarOpen(false)}
        />

        <main className="flex-1 flex flex-col lg:pl-64 min-w-0">
          <div className="flex-1">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};
