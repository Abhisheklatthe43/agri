import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Sprout,
  ScanSearch,
  CloudSun,
  Beaker,
  Droplets,
  BotMessageSquare,
  History,
  UserCheck,
  Bell,
  Settings
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/crop-recommendation', label: 'Crop Advisory', icon: Sprout },
  { path: '/disease-detection', label: 'Disease Detection', icon: ScanSearch },
  { path: '/weather', label: 'Weather Intelligence', icon: CloudSun },
  { path: '/fertilizer-advisory', label: 'Fertilizer Advisory', icon: Beaker },
  { path: '/irrigation-advisory', label: 'Irrigation Advisory', icon: Droplets },
  { path: '/ai-assistant', label: 'AI Farming Assistant', icon: BotMessageSquare },
  { path: '/history', label: 'Advisory History', icon: History },
  { path: '/profile', label: 'Farmer Profile', icon: UserCheck },
  { path: '/notifications', label: 'Notifications', icon: Bell },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar = ({ isOpen, closeSidebar }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar element */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-surface-border flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-surface-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-agri-700 text-white flex items-center justify-center shadow-sm">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-agri-900 tracking-tight">
                AgriSmart <span className="text-xs bg-agri-100 text-agri-800 font-semibold px-1.5 py-0.5 rounded">AI</span>
              </span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          <p className="px-3 text-[11px] font-semibold text-text-light uppercase tracking-wider mb-2">
            Agricultural Intelligence
          </p>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-agri-100 text-agri-900 shadow-xs'
                      : 'text-text-muted hover:text-text-main hover:bg-surface-hover'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Disclaimer / Sustainable badge */}
        <div className="p-4 border-t border-surface-border">
          <div className="p-3 rounded-xl bg-agri-50 border border-agri-200">
            <p className="text-[11px] font-bold text-agri-900 mb-0.5">🌱 Advisory Support</p>
            <p className="text-[10px] text-agri-700 leading-relaxed">
              AI recommendations are advisory guidance. Consult local agriculture extension offices for high-impact decisions.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
