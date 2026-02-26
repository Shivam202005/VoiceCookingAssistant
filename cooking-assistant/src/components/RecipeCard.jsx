import React from "react";
import { Link } from "react-router-dom";

export default function RecipeCard({ id, title, image, image_url, img, tag, cookTime, time, ready_in_minutes, servings, difficulty, likes_count }) {
  
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

  // 🔥 YAHAN VEG/NON-VEG LOGIC LAGAYA HAI (Undefined ki jagah)
  const isNonVeg = /chicken|mutton|egg|fish|prawn|meat|beef|pork/i.test(safeTitle);
  const dietLabel = isNonVeg ? "🔴 Non-Veg" : "🟢 Veg";
  const dietColor = isNonVeg ? "text-red-500" : "text-green-600";

  return (
    <Link to={`/recipe/${id}`} className="group block">
      <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100">
        
        {/* Image Container */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={displayImage}
            alt={safeTitle}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.target.src = "/images/f1.jpeg";
            }}
          />
          
          <div className="absolute top-3 left-3">
            <span className={`px-3 py-1 text-xs font-bold rounded-full ${getBadgeColor()} shadow-lg`}>
              {tag || "Tasty"}
            </span>
          </div>
          
          <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
             <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor()} shadow-sm`}>
              {difficulty || "Medium"}
            </span>
            
            <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-red-500 shadow-md flex items-center gap-1">
               ❤️ {likes_count || 0}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors truncate">
            {safeTitle}
          </h3>
          
          {/* 🔥 UNDEFINED GAYAB, VEG/NON-VEG SYMBOL IN */}
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