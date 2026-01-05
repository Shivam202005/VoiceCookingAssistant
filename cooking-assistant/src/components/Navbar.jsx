import React from "react";
import { useAuth } from "../context/AuthContext"; // Auth context import karo

// onOpenAuth prop receive karo
export default function Navbar({ searchQuery, setSearchQuery, onVoiceSearch, onOpenAuth }) {
  const { user, logout } = useAuth(); // User login hai ya nahi check karo

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
          {/* SVG Icon same rahega */}
        </div>
      </form>
      
      <div className="flex gap-2 md:gap-3">
        <button 
          onClick={onVoiceSearch}
          className="bg-orange-100 text-orange-700 px-3 md:px-5 py-2 rounded-full font-semibold text-sm md:text-base hover:bg-orange-200 transition-colors flex items-center gap-2"
        >
          {/* SVG same rahega */}
          Ask AI
        </button>

        {/* 👇 LOGIC CHANGE: Agar user login hai to Logout dikhao, nahi to Sign Up */}
        {user ? (
          <div className="flex items-center gap-3">
            <span className="hidden md:inline font-bold text-gray-700">Hi, {user.name}</span>
            <button 
              onClick={logout}
              className="bg-gray-200 text-gray-700 px-3 md:px-5 py-2 rounded-full font-semibold hover:bg-gray-300"
            >
              Logout
            </button>
          </div>
        ) : (
          <button 
            onClick={onOpenAuth} // 👇 Ye button ab modal kholega
            className="bg-orange-500 text-white px-3 md:px-5 py-2 rounded-full font-semibold text-sm md:text-base hover:bg-orange-600 transition-colors"
          >
            Sign Up
          </button>
        )}
      </div>
    </nav>
  );
}