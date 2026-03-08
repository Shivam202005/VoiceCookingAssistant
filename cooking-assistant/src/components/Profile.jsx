import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "/api";

export default function Profile() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [pendingRecipes, setPendingRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      if (!user) {
        alert("Please log in to view your profile.");
        navigate('/'); 
        return;
      }

      try {
        // Fetch User Profile
        const resProfile = await fetch(`${API_BASE_URL}/my-profile`);
        if (resProfile.status === 401) {
            alert("Session expired. Please log in again.");
            navigate('/'); return;
        }
        const dataProfile = await resProfile.json();
        setProfileData(dataProfile);

        // 🔥 Fetch Pending Recipes (ONLY IF ADMIN)
        if (dataProfile.user.role === 'admin') {
            const resPending = await fetch(`${API_BASE_URL}/admin/pending-recipes`);
            const dataPending = await resPending.json();
            setPendingRecipes(dataPending);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user, navigate]);

  // 🔥 Handle Approve / Reject
  const handleStatusChange = async (recipeId, newStatus) => {
    if(!window.confirm(`Are you sure you want to ${newStatus} this recipe?`)) return;
    try {
        const res = await fetch(`${API_BASE_URL}/admin/recipe/${recipeId}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        if(res.ok) {
            alert(`Recipe ${newStatus} successfully!`);
            setPendingRecipes(pendingRecipes.filter(r => r.id !== recipeId)); // Remove from list
        }
    } catch (e) {
        console.error(e);
        alert("Action failed!");
    }
  };

  if (loading) return <div className="text-center p-10 text-xl font-bold text-gray-500">Loading Profile...</div>;
  if (!profileData) return <div className="text-center p-10 text-red-500">Unable to load profile.</div>;

  const isAdmin = profileData.user.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* 👤 USER INFO CARD */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10 flex flex-col md:flex-row items-center gap-8 border-t-4 border-orange-500 relative overflow-hidden">
            {isAdmin && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-1 rounded-full font-black text-sm shadow-md animate-pulse">
                    👑 ADMIN ACCOUNT
                </div>
            )}
            
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center text-4xl font-bold text-orange-600 border-4 border-white shadow-md">
                {profileData.user.name ? profileData.user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            
            <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl font-bold text-gray-800">{profileData.user.name}</h1>
                <p className="text-gray-500 text-lg">{profileData.user.email}</p>
                <p className="text-xs text-gray-400 mt-1">Role: {profileData.user.role.toUpperCase()}</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 px-8 py-4 rounded-xl text-center border border-orange-200 shadow-sm">
                <p className="text-orange-600 font-extrabold text-4xl">{profileData.stats.total_recipes}</p>
                <p className="text-gray-600 font-medium text-sm uppercase tracking-wide">Recipes Posted</p>
            </div>
        </div>

        {/* 🔥 ADMIN PANEL: PENDING REQUESTS */}
        {isAdmin && pendingRecipes.length > 0 && (
            <div className="mb-12 bg-red-50 rounded-2xl p-6 border border-red-200 shadow-sm">
                <h2 className="text-2xl font-black text-red-600 mb-6 flex items-center gap-2">
                    🚨 Pending Approvals ({pendingRecipes.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingRecipes.map(recipe => (
                        <div key={recipe.id} className="bg-white rounded-xl shadow p-4 border border-red-100">
                            <img src={recipe.image_url || "https://via.placeholder.com/400x300"} alt={recipe.title} className="w-full h-32 object-cover rounded-lg mb-3" />
                            <h3 className="font-bold text-lg text-gray-800 truncate">{recipe.title}</h3>
                            <p className="text-xs text-gray-500 mb-4">By User ID: {recipe.author_id}</p>
                            
                            <div className="flex gap-2">
                                <button onClick={() => handleStatusChange(recipe.id, 'approved')} className="flex-1 bg-green-500 text-white font-bold py-2 rounded hover:bg-green-600 text-sm">
                                    ✅ Approve
                                </button>
                                <button onClick={() => handleStatusChange(recipe.id, 'rejected')} className="flex-1 bg-red-500 text-white font-bold py-2 rounded hover:bg-red-600 text-sm">
                                    ❌ Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

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
                {profileData.recipes.map((recipe) => {
                    const fallbackImages = [
                        "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=600&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1589302168068-964664d93cb0?w=600&auto=format&fit=crop"
                    ];
                    let displayImage = recipe.image_url;
                    if (!displayImage || displayImage.includes("placeholder") || !displayImage.startsWith("http")) {
                        displayImage = fallbackImages[(recipe.id || 0) % fallbackImages.length];
                    }

                    // 🔥 STATUS BADGE COLOR LOGIC
                    let statusColor = "bg-orange-500";
                    if(recipe.status === 'pending') statusColor = "bg-yellow-500";
                    if(recipe.status === 'rejected') statusColor = "bg-red-600";
                    if(recipe.status === 'approved') statusColor = "bg-green-500";

                    return (
                    <Link to={`/recipe/${recipe.id}`} key={recipe.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 group border border-gray-100">
                        <div className="h-52 overflow-hidden relative">
                            <img src={displayImage} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            
                            {/* 🔥 STATUS BADGE */}
                            <div className={`absolute top-0 right-0 ${statusColor} text-white text-xs font-bold px-3 py-1 rounded-bl-lg uppercase`}>
                                {recipe.status || 'YOUR RECIPE'}
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
                )})}
            </div>
        )}
      </div>
    </div>
  );
}