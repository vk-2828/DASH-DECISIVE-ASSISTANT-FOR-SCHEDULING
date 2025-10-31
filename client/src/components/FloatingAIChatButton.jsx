import React from 'react';

// --- NEW: Gemini-inspired Sparkle Icon ---
const SparkleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path fillRule="evenodd" d="M9.315 7.584C10.56 6.338 12.016 6 12.75 6s2.19.338 3.435 1.584c.31.31.62.657.914 1.023a.75.75 0 101.274-.829A12.091 12.091 0 0015.33 6.03a6.793 6.793 0 00-6.115.445 12.09 12.09 0 00-2.923 2.75.75.75 0 101.273.828c.295-.366.605-.714.915-1.024zM12.75 18a6.793 6.793 0 01-6.115-.445 12.09 12.09 0 01-2.923-2.75A.75.75 0 114.985 14c.294.366.604.714.914 1.023A4.28 4.28 0 009.315 16.416C10.56 17.662 12.016 18 12.75 18s2.19-.338 3.435-1.584c.31-.31.62-.657.914-1.023a.75.75 0 111.274.829 12.091 12.091 0 01-2.923 2.751 6.793 6.793 0 01-6.115-.445z" clipRule="evenodd" />
      <path d="M12.75 13.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z" />
    </svg>
);

// Close Icon (no changes)
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
       <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const FloatingAIChatButton = ({ onClick, isOpen }) => {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'} text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
      aria-label={isOpen ? "Close AI Chat" : "Open AI Chat"}
    >
      {isOpen ? <CloseIcon /> : <SparkleIcon />}
    </button>
  );
};

export default FloatingAIChatButton;









