// src/components/Navbar.jsx
import React from "react";

export default function Navbar({ searchQuery, setSearchQuery, onVoiceSearch }) {
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow sticky top-0 z-40">
      <div className="flex items-center space-x-2">
        <span className="text-orange-700 font-extrabold text-xl">🍳</span>
        <span className="text-lg font-bold">CookBuddy</span>
      </div>
      
      <form className="flex-1 mx-4 md:mx-8 max-w-xl" onSubmit={(e) => e.preventDefault()}>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search for recipes..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full py-2 px-4 pr-10 rounded-full bg-gray-100 text-gray-600 border focus:outline-none focus:ring-2 focus:ring-orange-300 focus:bg-white transition-all duration-200" 
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </form>
      
      <div className="flex gap-2 md:gap-3">
        <button 
          onClick={onVoiceSearch}
          className="bg-orange-100 text-orange-700 px-3 md:px-5 py-2 rounded-full font-semibold text-sm md:text-base hover:bg-orange-200 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2s2-.9 2-2V4c0-1.1-.9-2-2-2zm6.5 6H17c0 2.76-2.24 5-5 5s-5-2.24-5-5H5.5c0 3.53 2.61 6.43 6 6.92V21h2v-6.08c3.39-.49 6-3.39 6-6.92z"/>
          </svg>
          Ask AI
        </button>
        <button className="bg-orange-500 text-white px-3 md:px-5 py-2 rounded-full font-semibold text-sm md:text-base hover:bg-orange-600 transition-colors">
          Sign Up
        </button>
      </div>
    </nav>
  );
}
