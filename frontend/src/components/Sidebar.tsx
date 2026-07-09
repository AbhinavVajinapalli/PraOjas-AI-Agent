import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Bell, FileText, Settings, HeartPulse } from 'lucide-react';
import { useTheme } from '../App';

export default function Sidebar() {
  const { theme, setTheme, effectiveTheme } = useTheme();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/patients', label: 'Patients', icon: Users },
    { path: '/alerts', label: 'Alerts', icon: Bell },
    { path: '/reports', label: 'Reports', icon: FileText },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 flex-shrink-0 flex flex-col h-screen bg-slate-50 dark:bg-[#0B1120] border-r border-slate-200 dark:border-[#1e293b] transition-colors">
      {/* Logo Area — dark strip matching logo background */}
      <div className="w-full flex items-center justify-start bg-[#0a1628] px-4 py-3">
        <img
          src="/logo-2.jpg"
          alt="PraOjas AI"
          className="h-14 w-auto object-contain"
          style={{ maxWidth: '200px' }}
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 mt-4">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative ${
                isActive 
                  ? 'bg-indigo-50 dark:bg-slate-800/50 text-indigo-600 dark:text-[#06b6d4]' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/30'
              }`}
            >
              {/* Cyan active indicator on the left edge */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#06b6d4] rounded-r-full" />
              )}
              <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-600 dark:text-[#06b6d4]' : 'text-slate-500 dark:text-slate-400'}`} />
              <span className="font-medium text-sm">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
