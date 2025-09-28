import React from 'react';
import { View, Role } from '../types';
import { ClockIcon, ListIcon, ClipboardIcon, SwitchUserIcon } from './icons';


const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    width="250" 
    height="50" 
    viewBox="0 0 250 50" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="TRIJOSHH Logo"
  >
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="50%" x2="100%" y2="50%">
        <stop offset="0%" stopColor="#2563EB" />
        <stop offset="100%" stopColor="#10B981" />
      </linearGradient>
    </defs>
    <path d="M22.5 2 L2.5 25 L16.5 24 L6.5 48 L32.5 19 L17.5 21 Z" fill="url(#logoGradient)" />
    <text x="40" y="38" fontFamily="'Segoe UI', 'Arial', sans-serif" fontWeight="900" fontSize="32" letterSpacing="-1" fontStyle="italic" fill="url(#logoGradient)">
      TRIJOSHH
    </text>
    <text x="235" y="15" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="bold" className="fill-gray-800 dark:fill-gray-300">
      TM
    </text>
  </svg>
);

interface HeaderProps {
  currentView?: View;
  setCurrentView?: (view: View) => void;
  role: Role | null;
  onSwitchRole: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView, role, onSwitchRole }) => {
  const navItems = [
    { view: View.Dashboard, label: 'Dashboard', icon: <ClockIcon className="w-5 h-5 mr-2"/> },
    { view: View.History, label: 'History', icon: <ListIcon className="w-5 h-5 mr-2"/> },
    { view: View.WorkLog, label: 'Work Log', icon: <ClipboardIcon className="w-5 h-5 mr-2"/> },
  ];

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
             <Logo className="h-10 w-auto" />
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {role === Role.Employee && setCurrentView && (
                <nav className="flex space-x-2 sm:space-x-4">
                {navItems.map(item => (
                  <button
                    key={item.view}
                    onClick={() => setCurrentView(item.view)}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      currentView === item.view
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                    aria-current={currentView === item.view ? 'page' : undefined}
                  >
                    {item.icon}
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                ))}
              </nav>
            )}
             {role === Role.Admin && (
                <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200 hidden sm:block">Admin Panel</h1>
             )}
            {role && (
                <button
                    onClick={onSwitchRole}
                    className="flex items-center p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                    aria-label="Switch Role"
                >
                    <SwitchUserIcon className="w-5 h-5" />
                </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;