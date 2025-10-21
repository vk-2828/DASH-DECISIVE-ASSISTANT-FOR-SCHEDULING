import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 lg:px-8">
        <p className="text-center text-xs leading-5 text-gray-500">
          &copy; {new Date().getFullYear()} DASH, Inc. A Decisive Assistant for Scheduling. All rights reserved.
        </p>
      </div>
    </footer>
  )
};

export default Footer;