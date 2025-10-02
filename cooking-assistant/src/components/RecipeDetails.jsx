import React, { useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:5000";

export default function RecipeDetails() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRecipe() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/recipe/${id}`);
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        const data = await response.json();
        setRecipe(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchRecipe();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading recipe details...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4 text-4xl">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Recipe Not Found</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Link to="/" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-semibold transition-colors">Back to Recipes</Link>
        </div>
      </div>
    );

  if (!recipe) return <Navigate to="/" replace />;

  const badgeColor = recipe.tag === "FREE" ? "bg-green-500 text-white" : "bg-orange-500 text-white";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link to="/" className="inline-flex items-center gap-2 mb-8 text-orange-600 hover:text-orange-700 font-medium transition-colors group">
          <span className="text-lg font-bold">←</span>
          Back to Recipes
        </Link>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          {/* SIMPLIFIED IMAGE SECTION - NO COMPLEX POSITIONING */}
          <div className="w-full h-64 md:h-80 bg-gray-100 relative">
            <img 
              src="/images/f1.jpeg"
              alt={recipe.title}
              className="w-full h-full object-cover block"
              style={{ 
                maxWidth: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
            />
            {/* Badge positioned over image */}
            <div className="absolute top-4 left-4">
              <span className={`px-3 py-1 text-sm font-bold rounded-full ${badgeColor} shadow-lg`}>
                {recipe.tag}
              </span>
            </div>
          </div>

          <div className="p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{recipe.title}</h1>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">{recipe.desc}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-orange-600 text-xl">⏰</span>
                </div>
                <h3 className="font-semibold text-gray-800">Cook Time</h3>
                <p className="text-gray-600">{recipe.cookTime || "N/A"}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-blue-600 text-xl">👥</span>
                </div>
                <h3 className="font-semibold text-gray-800">Servings</h3>
                <p className="text-gray-600">{recipe.servings || "N/A"} people</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-green-600 text-xl">📊</span>
                </div>
                <h3 className="font-semibold text-gray-800">Difficulty</h3>
                <p className="text-gray-600">{recipe.difficulty || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Steps Section */}
        {recipe.steps && recipe.steps.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">📋</span>
              </div>
              Step-by-Step Cooking Instructions
            </h2>
            
            <div className="space-y-6">
              {recipe.steps.map((step, index) => (
                <div key={index} className="flex gap-4 group hover:bg-gray-50 p-4 rounded-lg transition-colors">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-orange-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Step {index + 1}</h3>
                    <p className="text-gray-700 leading-relaxed text-base">{step}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
              <h3 className="flex items-center text-lg font-semibold text-yellow-800 mb-2">
                <span className="mr-2">💡</span>
                Pro Tip
              </h3>
              <p className="text-yellow-700">
                Take your time with each step and taste as you go. Cooking is about adjusting flavors to your preference!
              </p>
            </div>
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-semibold transition-colors shadow-lg hover:shadow-xl"
          >
            <span className="font-bold">←</span>
            Explore More Recipes
          </Link>
        </div>
      </div>
    </div>
  );
}
