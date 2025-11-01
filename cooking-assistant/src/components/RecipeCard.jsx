import React from "react";
import { Link } from "react-router-dom";

export default function RecipeCard({ id, title, desc, img, tag, cookTime, servings, difficulty }) {
  const getBadgeColor = () => {
    if (tag === "FREE") return "bg-green-500 text-white";
    if (tag === "PREMIUM") return "bg-orange-500 text-white";
    return "bg-gray-500 text-white";
  };

  const getDifficultyColor = () => {
    if (difficulty === "Easy") return "text-green-600 bg-green-100";
    if (difficulty === "Medium") return "text-yellow-600 bg-yellow-100";
    if (difficulty === "Hard") return "text-red-600 bg-red-100";
    return "text-gray-600 bg-gray-100";
  };

  // Clean description
  const cleanDesc = desc?.replace(/<[^>]*>/g, '').substring(0, 120) + (desc?.length > 120 ? '...' : '');

  return (
    <Link to={`/recipe/${id}`} className="group block">
      <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100">
        {/* Image Container */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={img || "/images/f1.jpeg"}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.target.src = "/images/f1.jpeg";
            }}
          />
          
          {/* Badge */}
          <div className="absolute top-3 left-3">
            <span className={`px-3 py-1 text-xs font-bold rounded-full ${getBadgeColor()} shadow-lg`}>
              {tag}
            </span>
          </div>
          
          {/* Difficulty Badge */}
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor()}`}>
              {difficulty}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3 group-hover:text-orange-600 transition-colors">
            {title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-4 leading-relaxed">
            {cleanDesc}
          </p>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <span className="text-orange-500">⏰</span>
              <span className="font-medium">{cookTime}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <span className="text-blue-500">👥</span>
              <span className="font-medium">{servings} servings</span>
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
