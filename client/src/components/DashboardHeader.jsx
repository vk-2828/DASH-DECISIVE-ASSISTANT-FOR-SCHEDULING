import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

// Placeholder Icons - we will replace these with high-quality SVG icons later
const CalendarIcon = () => <span>📅</span>;
const BellIcon = () => <span>🔔</span>;
const UserIcon = () => <span>👤</span>;


const DashboardHeader = () => {
  const { user } = useAuth();

  return (
    <header className="w-full bg-white p-4 flex justify-between items-center border-b border-gray-200">
      {/* Search Bar */}
      <div className="relative w-full max-w-xs">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          {/* Search Icon */}
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
        <input 
          type="text" 
          placeholder="Search tasks..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Right-side Icons and Profile */}
      <div className="flex items-center space-x-6">
        <Link to="/tasks/calendar" className="text-gray-500 hover:text-gray-900">
          <CalendarIcon />
        </Link>
        <Link to="/tasks/notifications" className="text-gray-500 hover:text-gray-900">
          <BellIcon />
        </Link>

        <div className="relative">
          <Link to="/profile" className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-blue-600">
            <UserIcon />
            <span>{user?.name || 'My Account'}</span>
          </Link>
          {/* We can add a dropdown menu here later if needed */}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;