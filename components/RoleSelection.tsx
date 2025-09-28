import React from 'react';
import { Role } from '../types';

interface RoleSelectionProps {
  onSelectRole: (role: Role) => void;
}

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


const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelectRole }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full text-center">
        <Logo className="h-12 w-auto mx-auto mb-8" />
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          Welcome to the Attendance Tracker
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Please select your role to continue.</p>
        <div className="space-y-4">
          <button
            onClick={() => onSelectRole(Role.Employee)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105"
            aria-label="Login as Employee"
          >
            Login as Employee
          </button>
          <button
            onClick={() => onSelectRole(Role.Admin)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105"
            aria-label="Login as Admin"
          >
            Login as Admin
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
