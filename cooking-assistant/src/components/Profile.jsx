import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL = "/api";

export default function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = localStorage.getItem('user'); // Check login locally
        if (!token) {
            // ❌ Purana Code: navigate('/login');
            // ✅ Sahi Code: Home page par bhej do
            alert("Please log in to view your profile.");
            navigate('/'); 
            return;
        }

        const response = await fetch(`${API_BASE_URL}/my-profile`);
        
        if (response.status === 401) {
            // Agar session expire ho gaya (backend se 401 aaya)
            localStorage.removeItem('user');
            alert("Session expired. Please log in again.");
            // ✅ Sahi Code: Home page par bhej do
            navigate('/'); 
            return;
        }
        
        if (!response.ok) {
            throw new Error("Failed to fetch profile");
        }
        
        const data = await response.json();
        setProfileData(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [navigate]);

  if (loading) return <div className="text-center p-10 text-xl font-bold text-gray-500">Loading Profile...</div>;
  
  // Agar data load nahi hua to ye dikhao
  if (!profileData) return (
    <div className="text-center p-10">
        <p className="text-red-500 mb-4">Unable to load profile.</p>
        <Link to="/" className="text-blue-500 underline">Go back to Home</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* 👤 USER INFO CARD */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10 flex flex-col md:flex-row items-center gap-8 border-t-4 border-orange-500">
            {/* Avatar Placeholder */}
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center text-4xl font-bold text-orange-600 border-4 border-white shadow-md">
                {profileData.user.name ? profileData.user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            
            <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl font-bold text-gray-800">{profileData.user.name}</h1>
                <p className="text-gray-500 text-lg">{profileData.user.email}</p>
                <p className="text-xs text-gray-400 mt-1">User ID: {profileData.user.id}</p>
            </div>

            {/* Stats Box */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 px-8 py-4 rounded-xl text-center border border-orange-200 shadow-sm">
                <p className="text-orange-600 font-extrabold text-4xl">{profileData.stats.total_recipes}</p>
                <p className="text-gray-600 font-medium text-sm uppercase tracking-wide">Recipes Posted</p>
            </div>
        </div>

        {/* 🍲 MY RECIPES GRID */}
        <div className="flex items-center justify-between mb-6 border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-800">My Cookbook 📖</h2>
            <Link to="/" className="text-orange-600 hover:text-orange-700 font-medium">
                + Upload New Recipe
            </Link>
        </div>
        
        {profileData.recipes.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow border border-dashed border-gray-300">
                <p className="text-gray-500 text-lg mb-6">You haven't posted any recipes yet.</p>
                <Link to="/" className="bg-green-500 text-white px-8 py-3 rounded-full font-bold hover:bg-green-600 shadow-lg hover:shadow-xl transition-all">
                    Start Your Cooking Journey 🍳
                </Link>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {profileData.recipes.map((recipe) => (
                    <Link to={`/recipe/${recipe.id}`} key={recipe.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 group border border-gray-100">
                        <div className="h-52 overflow-hidden relative">
                            <img 
                                src={recipe.image_url || "https://via.placeholder.com/400x300?text=No+Image"} 
                                alt={recipe.title} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                                YOUR RECIPE
                            </div>
                        </div>
                        <div className="p-6">
                            <h3 className="font-bold text-xl mb-3 text-gray-800 truncate group-hover:text-orange-600 transition-colors">
                                {recipe.title}
                            </h3>
                            <div className="flex justify-between items-center text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                                <span className="flex items-center gap-1">⏱️ {recipe.ready_in_minutes}m</span>
                                <span className="flex items-center gap-1">👥 {recipe.servings} ppl</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        )}

      </div>
    </div>
  );
}