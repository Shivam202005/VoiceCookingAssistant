import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import RecipeCard from "./components/RecipeCard";
import VoiceModal from "./components/VoiceModal";
import RecipeDetails from "./components/RecipeDetails";


import { AuthProvider, useAuth } from './context/AuthContext';
import AuthForm from './components/AuthForm';
import ShareRecipeModal from './components/ShareRecipeModal';
import Profile from "./components/Profile";

const API_BASE_URL = "/api";

function Homepage() {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [selectedState, setSelectedState] = useState("All");
  const statesList = ["All", "Maharashtra", "Punjab", "Uttar Pradesh", "Bihar", "Tamil Nadu", "Rajasthan", "Gujarat"];

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/recipes`);
      const data = await response.json();
      setRecipes(data);
      setFilteredRecipes(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = recipes;

    if (searchQuery.trim() !== "") {
      result = result.filter(r => 
        (r.title && r.title.toLowerCase().includes(searchQuery.toLowerCase())) || 
        (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCountry !== "All") {
      result = result.filter(r => r.country === selectedCountry);
    }

    if (selectedCountry === "India" && selectedState !== "All") {
      result = result.filter(r => r.state === selectedState);
    }

    setFilteredRecipes(result);
  }, [searchQuery, selectedCountry, selectedState, recipes]);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      
      {/* 🚀 Navbar */}
      <Navbar 
        onAuthClick={() => setShowAuth(true)} 
        onLoginClick={() => setShowAuth(true)}
        onSignUpClick={() => setShowAuth(true)}
        onShareClick={() => setShowShareModal(true)} 
        onVoiceClick={() => setIsVoiceModalOpen(true)}
        onAskAIClick={() => setIsVoiceModalOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery} 
      />

     <div className="relative h-[400px] flex items-center justify-center text-white overflow-hidden z-0 bg-gray-900">
        <img 
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=2000" 
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          alt="Delicious Food Background"
        />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl font-black mb-4 drop-shadow-2xl">Discover Global & Regional Flavors</h1>
          <p className="text-xl font-medium text-gray-200 drop-shadow-md">Authentic recipes from every corner of the world</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-8 relative z-10">
        
        {/* SIDEBAR FILTER */}
        <div className="w-full md:w-64 bg-white p-6 rounded-2xl shadow-sm h-fit sticky top-24">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">Filters</h3>
          
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">Country</label>
            <select 
              className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-orange-400 outline-none"
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                setSelectedState("All"); 
              }}
            >
              <option value="All">All (Mixed)</option>
              <option value="India">India</option>
              <option value="Foreign">Foreign</option>
            </select>
          </div>

          {selectedCountry === "India" && (
            <div>
              <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">State</label>
              <div className="space-y-2">
                {statesList.map(state => (
                  <button
                    key={state}
                    onClick={() => setSelectedState(state)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                      selectedState === state 
                      ? "bg-orange-500 text-white font-bold shadow-md" 
                      : "text-gray-600 hover:bg-orange-50"
                    }`}
                  >
                    {state}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* MAIN GRID */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              {selectedCountry === "All" ? "All Recipes" : selectedState === "All" ? `${selectedCountry} Recipes` : `${selectedState} Specialities`}
              <span className="ml-3 text-lg font-normal text-gray-400">({filteredRecipes.length})</span>
            </h2>
          </div>

          {loading ? (
             <div className="text-center py-20 text-2xl">Loading Authentic Dishes...</div>
          ) : filteredRecipes.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-inner">
              <p className="text-gray-400 text-xl">No recipes found. Try searching something else!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRecipes.map((recipe) => {
                
                const indianImages = [
                  "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=600&auto=format&fit=crop",
                  "https://images.unsplash.com/photo-1589302168068-964664d93cb0?w=600&auto=format&fit=crop",
                  "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop",
                  "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop"
                ];

                const foreignImages = [
                  "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=600&auto=format&fit=crop",
                  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop",
                  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop"
                ];

                const safeId = recipe.id || Math.floor(Math.random() * 1000);
                const safeTitle = (recipe.title && String(recipe.title) !== "undefined") ? recipe.title : "Delicious Recipe";

                // 🔥 Veg / Non-Veg Logic
                const isNonVeg = /chicken|mutton|egg|fish|prawn|meat|beef|pork/i.test(safeTitle);
                const dietBadge = isNonVeg ? "🔴 Non-Veg" : "🟢 Veg";

                // 🔥 Stricter Image Logic (Fixes the ERR_NAME_NOT_RESOLVED)
                let finalImage = recipe.image_url || recipe.image || "";
                if (!finalImage || !finalImage.startsWith("http") || finalImage.includes("placeholder") || finalImage.includes("f1.jpeg") || finalImage === "undefined") {
                  if (recipe.country === "Foreign") {
                    finalImage = foreignImages[safeId % foreignImages.length];
                  } else {
                    finalImage = indianImages[safeId % indianImages.length];
                  }
                }

                const finalTime = recipe.cookTime || recipe.ready_in_minutes || recipe.time || 30;

                const fixedRecipe = {
                  ...recipe,
                  id: safeId,
                  title: safeTitle,
                  name: safeTitle,
                  time: finalTime,
                  cookTime: finalTime,
                  description: dietBadge, 
                  category: dietBadge,    
                  difficulty: recipe.difficulty || "Medium",
                  servings: recipe.servings || 4,
                  image_url: finalImage,
                  image: finalImage,
                  img: finalImage,
                  likes_count: recipe.likes_count || 0 
                };

                return (
                  <RecipeCard 
                    key={safeId} 
                    recipe={fixedRecipe} 
                    id={fixedRecipe.id}
                    title={fixedRecipe.title}
                    name={fixedRecipe.title}
                    description={dietBadge}
                    category={dietBadge}
                    tag={dietBadge}
                    image={fixedRecipe.image}
                    image_url={fixedRecipe.image}
                    img={fixedRecipe.image}
                    time={fixedRecipe.time}
                    cookTime={fixedRecipe.time}
                    ready_in_minutes={fixedRecipe.time}
                    difficulty={fixedRecipe.difficulty}
                    servings={fixedRecipe.servings}
                    likes_count={fixedRecipe.likes_count} 
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 🔥 Modals z-index force fix */}
      {(showAuth || showShareModal || isVoiceModalOpen) && (
        <div className="fixed inset-0 z-[999999] pointer-events-auto">
          {showAuth && <AuthForm onClose={() => setShowAuth(false)} />}
          {showShareModal && <ShareRecipeModal onClose={() => setShowShareModal(false)} />}
          <VoiceModal isOpen={isVoiceModalOpen} onClose={() => setIsVoiceModalOpen(false)} />
        </div>
      )}

    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/recipe/:id" element={<RecipeDetails />} />


          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;