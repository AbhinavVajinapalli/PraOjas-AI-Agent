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
    <div className="w-64 flex-shrink-0 flex flex-col h-screen bg-[#0B1120] border-r border-[#1e293b]">
      {/* Logo Area */}
      <div className="px-6 py-8 flex items-center gap-3">
        {/* Stylized P Logo matching reference */}
        <div className="relative flex items-center justify-center w-8 h-8 flex-shrink-0">
          <svg viewBox="0 0 40 40" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 10C14 7.79086 15.7909 6 18 6H24C28.4183 6 32 9.58172 32 14C32 18.4183 28.4183 22 24 22H18C15.7909 22 14 20.2091 14 18V10Z" fill="url(#paint0_linear)"/>
            <path d="M14 20C14 17.7909 15.7909 16 18 16H22C26.4183 16 30 19.5817 30 24C30 28.4183 26.4183 32 22 32H18C15.7909 32 14 30.2091 14 28V20Z" fill="url(#paint1_linear)" />
            <path d="M8 14C8 11.7909 9.79086 10 12 10H14V30H12C9.79086 30 8 28.2091 8 26V14Z" fill="#3B82F6"/>
            <defs>
              <linearGradient id="paint0_linear" x1="14" y1="6" x2="32" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38BDF8"/>
                <stop offset="1" stopColor="#818CF8"/>
              </linearGradient>
              <linearGradient id="paint1_linear" x1="14" y1="16" x2="30" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#818CF8"/>
                <stop offset="1" stopColor="#3B82F6"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <span className="font-semibold text-lg text-white tracking-wide">PraOjas AI</span>
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
                  ? 'bg-slate-800/50 text-[#06b6d4]' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              {/* Cyan active indicator on the left edge */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#06b6d4] rounded-r-full" />
              )}
              <item.icon className={`w-5 h-5 ${isActive ? 'text-[#06b6d4]' : 'text-slate-400'}`} />
              <span className="font-medium text-sm">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
