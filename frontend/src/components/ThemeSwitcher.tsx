import React from 'react';
import { useTheme } from './ThemeProvider';
import { Moon, Sun, Laptop } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1 relative overflow-hidden">
      <button
        onClick={() => setTheme('light')}
        className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${theme === 'light' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-300'}`}
        title="Light Mode"
      >
        <Sun className="w-4 h-4" />
        {theme === 'light' && (
          <motion.div
            layoutId="theme-bubble"
            className="absolute inset-0 bg-slate-200 rounded-lg -z-10"
            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
          />
        )}
      </button>

      <button
        onClick={() => setTheme('system')}
        className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${theme === 'system' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-300'}`}
        title="System Preference"
      >
        <Laptop className="w-4 h-4" />
        {theme === 'system' && (
          <motion.div
            layoutId="theme-bubble"
            className="absolute inset-0 bg-slate-200 rounded-lg -z-10"
            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
          />
        )}
      </button>

      <button
        onClick={() => setTheme('dark')}
        className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${theme === 'dark' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-300'}`}
        title="Dark Mode"
      >
        <Moon className="w-4 h-4" />
        {theme === 'dark' && (
          <motion.div
            layoutId="theme-bubble"
            className="absolute inset-0 bg-slate-200 rounded-lg -z-10"
            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
          />
        )}
      </button>
    </div>
  );
}
