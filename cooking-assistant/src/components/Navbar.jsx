import React from "react";
export default function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow">
      <div className="flex items-center space-x-2">
        <span className="text-orange-700 font-extrabold text-xl">🍳</span>
        <span className="text-lg font-bold">CookBuddy</span>
      </div>
      <form className="flex-1 mx-8 max-w-xl">
        <input type="text" placeholder="Search for recipes..."
            className="w-full py-2 px-4 rounded-full bg-gray-100 text-gray-600 border focus:outline-none" />
      </form>
      <div className="flex gap-3">
        <button className="bg-orange-100 text-orange-700 px-5 py-2 rounded-full font-semibold">
          Ask AI
        </button>
        <button className="bg-orange-500 text-white px-5 py-2 rounded-full font-semibold">
          Sign Up
        </button>
      </div>
    </nav>
  );
}
