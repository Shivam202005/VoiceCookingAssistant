// src/components/RecipeCard.jsx
import React from "react";

export default function RecipeCard({ title, desc, img, tag }) {
  const badgeColor = tag === "FREE" 
    ? "bg-green-500 text-white" 
    : "bg-orange-500 text-white";
  
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden w-full hover:shadow-lg transition-shadow duration-300 relative">
      <div className="relative">
        <img src={img} alt={title} className="w-full h-40 sm:h-32 object-cover" />
        <span className={`absolute top-2 left-2 px-2 py-1 text-xs font-semibold rounded-md ${badgeColor} shadow-sm`}>
          {tag}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 text-gray-800 line-clamp-2">{title}</h3>
        <p className="text-sm text-gray-600 line-clamp-3">{desc}</p>
      </div>
    </div>
  );
}
