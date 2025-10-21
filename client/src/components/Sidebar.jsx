import React from 'react';
import { NavLink } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

// Placeholder icons - we'll replace these with real SVG icons later
const HomeIcon = () => <span>🏠</span>;
const StarIcon = () => <span>⭐</span>;
const CheckIcon = () => <span>✔️</span>;
const TrashIcon = () => <span>🗑️</span>;

const Sidebar = () => {
  const { logout } = useAuth();

  // These classes will be applied to the active NavLink
  const activeLinkClass = "bg-blue-100 text-blue-600 border-l-4 border-blue-600";
  // These classes are for the inactive links
  const inactiveLinkClass = "text-gray-600 hover:bg-gray-100 hover:text-gray-900";

  return (
    <div className="flex flex-col w-64 h-screen px-4 py-8 bg-white border-r">
      <Link to="/" className="text-3xl font-bold text-blue-600">DASH</Link>
      
      <div className="flex flex-col justify-between flex-1 mt-6">
        <nav>
          <NavLink
            to="/tasks"
            end // 'end' prop ensures this only matches the exact '/tasks' path
            className={({ isActive }) => 
              `flex items-center px-4 py-2 mt-5 rounded-md ${isActive ? activeLinkClass : inactiveLinkClass}`
            }
          >
            <HomeIcon />
            <span className="mx-4 font-medium">All Tasks</span>
          </NavLink>

          <NavLink
            to="/tasks/starred"
            className={({ isActive }) => 
              `flex items-center px-4 py-2 mt-5 rounded-md ${isActive ? activeLinkClass : inactiveLinkClass}`
            }
          >
            <StarIcon />
            <span className="mx-4 font-medium">Starred</span>
          </NavLink>

          <NavLink
            to="/tasks/completed"
            className={({ isActive }) => 
              `flex items-center px-4 py-2 mt-5 rounded-md ${isActive ? activeLinkClass : inactiveLinkClass}`
            }
          >
            <CheckIcon />
            <span className="mx-4 font-medium">Completed</span>
          </NavLink>

          <NavLink
            to="/tasks/trash"
            className={({ isActive }) => 
              `flex items-center px-4 py-2 mt-5 rounded-md ${isActive ? activeLinkClass : inactiveLinkClass}`
            }
          >
            <TrashIcon />
            <span className="mx-4 font-medium">Trash</span>
          </NavLink>
        </nav>

        <div>
          <button 
            onClick={logout} 
            className="w-full flex items-center px-4 py-2 mt-5 text-gray-600 rounded-md hover:bg-red-100 hover:text-red-700"
          >
            {/* Placeholder for logout icon */}
            <span>🚪</span> 
            <span className="mx-4 font-medium">Log out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// We need to import Link for the main logo
import { Link } from 'react-router-dom';
export default Sidebar;