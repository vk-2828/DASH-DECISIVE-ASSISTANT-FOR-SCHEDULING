// import React from 'react';
// import { Link, NavLink } from 'react-router-dom';
// import useAuth from '../hooks/useAuth';

// // --- NEW: Professional SVG Icons ---
// // (Heroicons - https://heroicons.com/)

// const ListIcon = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
//   </svg>
// );
// const StarIcon = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.31h5.4c.566 0 .793.812.383 1.077l-4.337 3.16a.563.563 0 00-.18.636l1.62 5.091a.562.562 0 01-.813.621l-4.337-3.16a.563.563 0 00-.651 0l-4.337 3.16a.562.562 0 01-.813-.621l1.62-5.091a.563.563 0 00-.18-.636l-4.337-3.16a.562.562 0 01.383-1.077h5.4a.563.563 0 00.475-.31l2.125-5.11z" />
//   </svg>
// );
// const CheckIcon = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//   </svg>
// );
// const TrashIcon = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9M9.26 9l.94 6.936m2.613-6.936L14.74 9M14.74 9l-2.226-2.226c-.34-.34-.8-.53-1.28-.53s-.94.19-1.28.53L9.26 9m9.46-4.125l-2.828-2.828A4.5 4.5 0 0012 4.5v2.25M7.5 4.5v2.25m6 13.5v-2.25a.75.75 0 00-.75-.75h-3.5a.75.75 0 00-.75.75v2.25m4.125 0H9.375c-.621 0-1.125-.504-1.125-1.125V9.75c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125z" />
//   </svg>
// );
// const LogoutIcon = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
//   </svg>
// );
// // --- End Icons ---


// const Sidebar = () => {
//   const { logout } = useAuth();

//   // --- NEW: Theme-aligned classes ---
//   const activeLinkClass = "bg-indigo-50 text-button-primary border-l-4 border-button-primary font-medium";
//   const inactiveLinkClass = "text-gray-600 hover:bg-indigo-50 hover:text-button-primary";

//   return (
//     <div className="flex-col w-64 h-screen px-4 py-8 bg-white border-r hidden md:flex"> {/* Hide on mobile */}
      
//       {/* Updated DASH link to match public header */}
//       <Link to="/dashboard" className="-m-1.5 p-1.5 flex items-center gap-2 group mb-6">
//         <span className="text-3xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-text-link">
//           DASH
//         </span>
//       </Link>
      
//       <div className="flex flex-col justify-between flex-1">
//         <nav>
//           <NavLink
//             to="/dashboard" // Changed to /dashboard for index
//             end 
//             className={({ isActive }) => 
//               `flex items-center px-4 py-2 mt-5 rounded-md ${isActive ? activeLinkClass : inactiveLinkClass}`
//             }
//           >
//             <ListIcon />
//             <span className="mx-4 font-medium">All Tasks</span>
//           </NavLink>

//           <NavLink
//             to="/dashboard/starred" // Prefixed with /dashboard
//             className={({ isActive }) => 
//               `flex items-center px-4 py-2 mt-5 rounded-md ${isActive ? activeLinkClass : inactiveLinkClass}`
//             }
//           >
//             <StarIcon />
//             <span className="mx-4 font-medium">Starred</span>
//           </NavLink>

//           <NavLink
//             to="/dashboard/completed" // Prefixed with /dashboard
//             className={({ isActive }) => 
//               `flex items-center px-4 py-2 mt-5 rounded-md ${isActive ? activeLinkClass : inactiveLinkClass}`
//             }
//           >
//             <CheckIcon />
//             <span className="mx-4 font-medium">Completed</span>
//           </NavLink>

//           <NavLink
//             to="/dashboard/trash" // Prefixed with /dashboard
//             className={({ isActive }) => 
//               `flex items-center px-4 py-2 mt-5 rounded-md ${isActive ? activeLinkClass : inactiveLinkClass}`
//             }
//           >
//             <TrashIcon />
//             <span className="mx-4 font-medium">Trash</span>
//           </NavLink>
//         </nav>

//         <div>
//           <button 
//             onClick={logout} 
//             className="w-full flex items-center px-4 py-2 mt-5 text-gray-600 rounded-md hover:bg-red-50 hover:text-red-700"
//           >
//             <LogoutIcon />
//             <span className="mx-4 font-medium">Log out</span>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;









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