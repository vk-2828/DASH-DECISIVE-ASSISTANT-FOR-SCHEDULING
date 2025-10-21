import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  // This is the header for the PUBLIC pages (before login)
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link to="/home" className="-m-1.5 p-1.5">
            <span className="text-2xl font-bold text-blue-600">DASH</span>
          </Link>
        </div>
        <div className="flex items-center gap-x-8">
            <Link to="/register" className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-600">
              Register
            </Link>
            <Link to="/login" className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-600">
              Log in
            </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;