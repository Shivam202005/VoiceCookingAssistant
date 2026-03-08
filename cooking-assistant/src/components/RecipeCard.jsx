import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "/api";

export default function RecipeCard({ id, title, image, image_url, img, tag, cookTime, time, ready_in_minutes, servings, difficulty, likes_count }) {
  
  const { user } = useAuth(); // 🔥 Check for admin

  const getBadgeColor = () => {
    if (tag === "FREE") return "bg-green-500 text-white";
    if (tag === "Foreign") return "bg-blue-500 text-white";
    return "bg-orange-500 text-white";
  };

  const getDifficultyColor = () => {
    if (difficulty === "Easy") return "text-green-600 bg-green-100";
    if (difficulty === "Medium") return "text-yellow-600 bg-yellow-100";
    if (difficulty === "Hard") return "text-red-600 bg-red-100";
    return "text-gray-600 bg-gray-100";
  };

  const displayImage = image_url || image || img || "/images/f1.jpeg";
  const displayTime = cookTime || time || ready_in_minutes || 30;
  const safeTitle = title || "Delicious Recipe";

  const isNonVeg = /chicken|mutton|egg|fish|prawn|meat|beef|pork/i.test(safeTitle);
  const dietLabel = isNonVeg ? "🔴 Non-Veg" : "🟢 Veg";
  const dietColor = isNonVeg ? "text-red-500" : "text-green-600";

  // 🔥 DELETE FUNCTION FOR ADMIN
  const handleDelete = async (e) => {
    e.preventDefault(); // Link click rokne ke liye
    if(!window.confirm(`Are you sure you want to completely delete "${safeTitle}"?`)) return;

    try {
        const res = await fetch(`${API_BASE_URL}/admin/recipe/${id}/delete`, { method: 'DELETE' });
        if(res.ok) {
            alert("Recipe deleted successfully!");
            window.location.reload(); // Page refresh to remove card
        } else {
            alert("Failed to delete recipe.");
        }
    } catch(err) {
        console.error(err);
        alert("Error connecting to server.");
    }
  };

  return (
    <Link to={`/recipe/${id}`} className="group block relative">
      <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100 relative">
        
        {/* 🔥 ADMIN DELETE BUTTON (Z-index high to click easily) */}
        {user?.role === 'admin' && (
            <button 
                onClick={handleDelete}
                className="absolute top-2 right-2 bg-white/90 hover:bg-red-600 hover:text-white text-red-500 p-2 rounded-full shadow-lg z-20 transition-colors"
                title="Delete Recipe"
            >
                🗑️
            </button>
        )}

        <div className="relative h-48 overflow-hidden z-0">
          <img
            src={displayImage}
            alt={safeTitle}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => { e.target.src = "/images/f1.jpeg"; }}
          />
          
          <div className="absolute top-3 left-3">
            <span className={`px-3 py-1 text-xs font-bold rounded-full ${getBadgeColor()} shadow-lg`}>
              {tag || "Tasty"}
            </span>
          </div>
          
          <div className="absolute top-3 right-3 flex flex-col gap-2 items-end mt-10">
             <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor()} shadow-sm`}>
              {difficulty || "Medium"}
            </span>
            <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-red-500 shadow-md flex items-center gap-1">
               ❤️ {likes_count || 0}
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors truncate">
            {safeTitle}
          </h3>
          
          <p className={`text-sm mb-4 font-bold ${dietColor}`}>
            {dietLabel}
          </p>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <span className="text-orange-500">⏰</span>
              <span className="font-medium">{displayTime}m</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-blue-500">👥</span>
              <span className="font-medium">{servings || 4} ppl</span>
            </div>
          </div>

          <div className="mt-4 flex items-center text-orange-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
            <span>View Recipe</span>
            <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}