import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import {
  Bell,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Sprout,
  Settings
} from 'lucide-react';

export const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, profile, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Farmer';
  const locationTag = profile?.district ? `${profile.district}, ${profile.state}` : 'Farm Location Setup';

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-surface-border shadow-xs">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Left section: Hamburger for mobile + Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 text-text-muted hover:text-text-main lg:hidden rounded-lg hover:bg-surface-hover"
            aria-label="Toggle Navigation"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-agri-700 text-white flex items-center justify-center shadow-sm">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-agri-900 tracking-tight flex items-center gap-1">
                AgriSmart <span className="text-xs bg-agri-100 text-agri-800 font-semibold px-1.5 py-0.5 rounded">AI</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Right Section: Location Pill, Notifications, User Menu */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-agri-50 border border-agri-200 text-xs text-agri-900 font-medium">
            <span className="w-2 h-2 rounded-full bg-agri-600 animate-pulse" />
            <span>📍 {locationTag}</span>
          </div>

          {/* Notifications Bell */}
          <Link
            to="/notifications"
            className="relative p-2 text-text-muted hover:text-text-main rounded-xl hover:bg-surface-hover transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-surface-hover transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-agri-100 text-agri-800 font-semibold flex items-center justify-center text-xs border border-agri-200">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-text-main leading-tight">{displayName}</p>
                <p className="text-[11px] text-text-muted capitalize">{profile?.farm_area ? `${profile.farm_area} ${profile.farm_area_unit || 'acre'}` : 'Farmer'}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-text-muted hidden sm:block" />
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-surface-border py-1.5 z-50 animate-in fade-in slide-in-from-top-2"
                onClick={() => setDropdownOpen(false)}
              >
                <div className="px-4 py-2 border-b border-surface-border">
                  <p className="text-xs font-semibold text-text-main">{displayName}</p>
                  <p className="text-xs text-text-muted truncate">{user?.email}</p>
                </div>

                <Link
                  to="/profile"
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-text-main hover:bg-surface-hover"
                >
                  <User className="w-4 h-4 text-text-muted" />
                  Farmer Profile
                </Link>

                <Link
                  to="/settings"
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-text-main hover:bg-surface-hover"
                >
                  <Settings className="w-4 h-4 text-text-muted" />
                  Settings & Preferences
                </Link>

                <div className="border-t border-surface-border my-1" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
