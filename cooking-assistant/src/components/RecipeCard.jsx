import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function RecipeCard({ id, title, desc, img, tag, cookTime, difficulty, servings }) {
  const [imgError, setImgError] = useState(false);
  const badgeColor = tag === "FREE" ? "bg-green-500 text-white" : "bg-orange-500 text-white";
  const fallbackImg = "/static/images/f1.jpeg";

  return (
    <Link
      to={`/recipe/${id}`}
      className="block bg-white shadow-md rounded-lg overflow-hidden w-full hover:shadow-xl transform hover:scale-105 transition-all duration-300 relative cursor-pointer group"
    >
      <div className="relative overflow-hidden">
        <img
          src={imgError ? fallbackImg : img}
          alt={title}
          loading="lazy"
          className="w-full h-40 sm:h-48 object-cover"
          onError={() => setImgError(true)}
        />
        <span className={`absolute top-3 left-3 px-3 py-1 text-xs font-semibold rounded-full ${badgeColor} shadow-lg z-10`}>
          {tag}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg mb-2 text-gray-800 line-clamp-2 group-hover:text-orange-600 transition-colors">{title}</h3>
        <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">{desc}</p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          {cookTime && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <span>{cookTime}</span>
            </div>
          )}
          {difficulty && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
              <span>{difficulty}</span>
            </div>
          )}
          {servings && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              <span>{servings}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
