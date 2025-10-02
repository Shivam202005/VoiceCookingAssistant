import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import RecipeCard from "./RecipeCard";
import Navbar from "./Navbar";

const API_BASE_URL = "http://127.0.0.1:5000";

export default function AllPremiumRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRecipes() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/recipes`);
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        const data = await response.json();
        setRecipes(data.premium || []);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchRecipes();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading premium recipes...</p>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="text-red-400 mb-4 text-4xl">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Failed to load recipes</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Link to="/" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-semibold transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-10">
        <Link to="/" className="inline-flex items-center gap-2 mb-8 text-orange-600 hover:text-orange-700 font-medium transition-colors group">
          <span className="text-lg font-bold">←</span>
          Back to Home
        </Link>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="bg-orange-500 text-white px-4 py-2 rounded-full text-lg font-bold">PREMIUM</span>
            <h1 className="text-4xl font-bold text-gray-900">Premium Recipes</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Exclusive chef-crafted recipes with detailed instructions and professional tips.
          </p>
          <div className="mt-4">
            <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">
              {recipes.length} premium recipes available
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} {...recipe} />
          ))}
        </div>

        {recipes.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4 text-6xl">👨‍🍳</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No premium recipes available</h3>
            <p className="text-gray-500">Subscribe to unlock exclusive content!</p>
          </div>
        )}
      </div>
    </div>
  );
}
