import React from 'react';
import { Link } from 'react-router-dom';
import logoLight from '../assets/logo_light.png'; // Use the new logo for light theme

const Header = () => {
  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link to="/home" className="-m-1.5 p-1.5 flex items-center gap-2 group"> {/* Added group for logo hover */}
            {/* <img 
              className="h-8 w-auto transition-transform duration-200 group-hover:scale-105" // Logo animation
              src={logoLight} 
              alt="DASH Logo" 
            /> */}
            <span className="text-2xl font-bold text-gray-900 group-hover:text-text-link transition-colors duration-200">DASH</span>
          </Link>
        </div>
        <div className="flex items-center gap-x-8">
          <Link 
            to="/register" 
            className="text-sm font-semibold leading-6 text-gray-700 hover:text-text-link transition-colors duration-200 hover:scale-105"
          >
            Register
          </Link>
          <Link 
            to="/login" 
            className="text-sm font-semibold leading-6 text-gray-700 hover:text-text-link transition-colors duration-200 hover:scale-105"
          >
            Log in
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;





// import React from 'react';
// import { Link } from 'react-router-dom';

// const Header = () => {
//   // This is the header for the PUBLIC pages (before login)
//   return (
//     <header className="bg-white shadow-sm sticky top-0 z-50">
//       <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
//         <div className="flex lg:flex-1">
//           <Link to="/home" className="-m-1.5 p-1.5">
//             <span className="text-2xl font-bold text-blue-600">DASH</span>
//           </Link>
//         </div>
//         <div className="flex items-center gap-x-8">
//             <Link to="/register" className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-600">
//               Register
//             </Link>
//             <Link to="/login" className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-600">
//               Log in
//             </Link>
//         </div>
//       </nav>
//     </header>
//   );
// };

// export default Header;