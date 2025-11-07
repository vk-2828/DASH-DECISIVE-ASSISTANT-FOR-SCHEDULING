// import React from 'react';
// import { Link } from 'react-router-dom';
// import useAuth from '../hooks/useAuth';
// import useTasks from '../hooks/useTasks';

// // --- NEW: Professional SVG Icons ---
// const CalendarIcon = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3.75h10.5m-10.5 3.75h10.5m-10.5 3.75h10.5m-10.5 3.75h10.5m-10.5 3.75h10.5m-10.5 3.75h10.5m-10.5 3.75h10.5m-10.5 3.75h10.5M6.75 21v-3.75m10.5 3.75v-3.75m0 0h-10.5" />
//   </svg>
// );
// const BellIcon = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a.75.75 0 01-1.06 0l-1.06-1.061a.75.75 0 011.06-1.06l1.06 1.06a.75.75 0 010 1.061zm-4.633 0a.75.75 0 01-1.06 0l-1.06-1.061a.75.75 0 011.06-1.06l1.06 1.06a.75.75 0 010 1.061zM12 21a2.25 2.25 0 01-2.25-2.25H14.25A2.25 2.25 0 0112 21zm-2.25-4.5h4.5m-4.5 0a.75.75 0 010-1.061l1.06-1.06a.75.75 0 011.06 0l1.06 1.061a.75.75 0 010 1.061m-4.633 0a.75.75 0 01-1.06 0l-1.06-1.061a.75.75 0 011.06-1.06l1.06 1.06a.75.75 0 010 1.061z" />
//   </svg>
// );
// const UserIcon = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
//   </svg>
// );
// // --- End Icons ---

// const DashboardHeader = () => {
//   const { user } = useAuth();
//   const { searchTerm, setSearchTerm } = useTasks();

//   return (
//     <header className="w-full bg-white p-4 flex justify-between items-center border-b border-gray-200 space-x-4">
      
//       {/* Search Bar - Redesigned */}
//       <div className="relative flex-1 max-w-xs">
//         <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
//           <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
//         </div>
//         <input 
//           type="text" 
//           placeholder="Search tasks by title..."
//           // Updated search bar styles
//           className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-button-primary focus:border-transparent text-sm"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//       </div>

//       {/* Right-side Icons and Profile - Redesigned */}
//       <div className="flex items-center space-x-6">
//         <Link to="/dashboard/calendar" className="text-gray-500 hover:text-text-link transition-colors duration-200" title="Calendar">
//           <CalendarIcon />
//         </Link>
//         <Link to="/dashboard/notifications" className="text-gray-500 hover:text-text-link transition-colors duration-200" title="Notifications">
//           <BellIcon />
//         </Link>
//         <div className="relative">
//           <Link to="/dashboard/profile" className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-text-link transition-colors duration-200 group">
//             <UserIcon className="text-gray-500 group-hover:text-text-link" />
//             <span>{user?.name || 'My Account'}</span>
//           </Link>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default DashboardHeader;






import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useTasks from '../hooks/useTasks'; // Import the useTasks hook

// Placeholder Icons (no changes)
const CalendarIcon = () => <span>📅</span>;
const BellIcon = () => <span>🔔</span>;
const UserIcon = () => <span>👤</span>;

const DashboardHeader = () => {
  const { user } = useAuth();
  
  // --- NEW: Get search state and setter from the context ---
  const { searchTerm, setSearchTerm } = useTasks();

  return (
    <header className="w-full bg-white p-4 flex justify-between items-center border-b border-gray-200 space-x-4">
      
      {/* Search Bar - Now fully functional */}
      <div className="relative flex-1 max-w-xs">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
        <input 
          type="text" 
          placeholder="Search tasks by title..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
          // --- NEW: Connect input value and onChange ---
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Right-side Icons and Profile (no changes) */}
      <div className="flex items-center space-x-6">
        <Link to="/tasks/calendar" className="text-gray-500 hover:text-gray-900" title="Calendar">
          <CalendarIcon />
        </Link>
        <Link to="/tasks/notifications" className="text-gray-500 hover:text-gray-900" title="Notifications">
          <BellIcon />
        </Link>
        <div className="relative">
          <Link to="/profile" className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-blue-600">
            <UserIcon />
            <span>{user?.name || 'My Account'}</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;







