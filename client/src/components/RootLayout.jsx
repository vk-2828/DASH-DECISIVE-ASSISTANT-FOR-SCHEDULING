import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const RootLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow">
        {/* The Outlet is a placeholder from react-router-dom. */}
        {/* It will be replaced by the component of the current route, e.g., HomePage. */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default RootLayout;