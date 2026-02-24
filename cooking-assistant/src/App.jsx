import React, { useState, useEffect, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Fuse from "fuse.js";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import RecipeCard from "./components/RecipeCard";
import VoiceModal from "./components/VoiceModal";
import RecipeDetails from "./components/RecipeDetails";
import AllFreeRecipes from "./components/AllFreeRecipes";
import AllPremiumRecipes from "./components/AllPremiumRecipes";
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthForm from './components/AuthForm';
import ShareRecipeModal from './components/ShareRecipeModal';
import Profile from "./components/Profile";

const API_BASE_URL = "/api"; 

function AppLoadingSpinner() { return <div className="p-10 text-center">Loading...</div> }
function AppErrorMessage({message}) { return <div className="p-10 text-red-500">{message}</div> }

function Homepage() {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  
  // 🔥 Naye States (Regional Filter ke liye)
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCountry, setSelectedCountry] = useState("India");
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
      // Pura data aane par by default sirf India ki recipes dikhao
      setFilteredRecipes(data.filter(r => r.country === "India"));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      setLoading(false);
    }
  };

  // 🔥 Filter Logic
  useEffect(() => {
    let result = recipes;
    if (selectedCountry !== "All") {
      result = result.filter(r => r.country === selectedCountry);
    }
    if (selectedState !== "All") {
      result = result.filter(r => r.state === selectedState);
    }
    setFilteredRecipes(result);
  }, [selectedCountry, selectedState, recipes]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🚀 Tumhara purana Navbar (Safe and sound) */}
      <Navbar 
        onAuthClick={() => setShowAuth(true)} 
        onShareClick={() => setShowShareModal(true)} 
        onVoiceClick={() => setIsVoiceModalOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* 🇮🇳 Naya Indian Hero Section */}
      <div className="relative h-[400px] flex items-center justify-center text-white overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1585932231552-2981bd112a4f?auto=format&fit=crop&q=80&w=2000" 
          className="absolute inset-0 w-full h-full object-cover brightness-50"
          alt="Indian Spices"
        />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl font-black mb-4 drop-shadow-lg">Discover Regional Flavors</h1>
          <p className="text-xl opacity-90">Authentic recipes from every corner of India</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">
        
        {/* 🥗 SIDEBAR FILTER */}
        <div className="w-full md:w-64 bg-white p-6 rounded-2xl shadow-sm h-fit sticky top-24">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">📍 Filters</h3>
          
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

        {/* 🍲 MAIN GRID */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              {selectedState === "All" ? `${selectedCountry} Recipes` : `${selectedState} Specialities`}
              <span className="ml-3 text-lg font-normal text-gray-400">({filteredRecipes.length})</span>
            </h2>
          </div>

          {loading ? (
             <div className="text-center py-20 text-2xl">Loading Authentic Dishes...</div>
          ) : filteredRecipes.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-inner">
              <p className="text-gray-400 text-xl">No recipes found for this region yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRecipes.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 🚀 Tumhare purane Modals (Safe and sound) */}
      {showAuth && <AuthForm onClose={() => setShowAuth(false)} />}
      {showShareModal && <ShareRecipeModal onClose={() => setShowShareModal(false)} />}
      <VoiceModal isOpen={isVoiceModalOpen} onClose={() => setIsVoiceModalOpen(false)} />
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
          <Route path="/free-recipes" element={<AllFreeRecipes />} />
          <Route path="/premium-recipes" element={<AllPremiumRecipes />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;