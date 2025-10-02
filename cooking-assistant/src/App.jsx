import React, { useState, useEffect, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"; // ← Link add kiya
import Fuse from "fuse.js";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import RecipeCard from "./components/RecipeCard";
import VoiceModal from "./components/VoiceModal";
import RecipeDetails from "./components/RecipeDetails";
import AllFreeRecipes from "./components/AllFreeRecipes";
import AllPremiumRecipes from "./components/AllPremiumRecipes";

const API_BASE_URL = "http://127.0.0.1:5000";

// Loading Component
function AppLoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading delicious recipes...</p>
      </div>
    </div>
  );
}

// Error Component
function AppErrorMessage({ message, onRetry }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-400 mb-4 text-4xl">⚠️</div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">Oops! Something went wrong</h3>
        <p className="text-gray-500 mb-4">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-semibold transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

function Homepage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [recipes, setRecipes] = useState({ free: [], premium: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/recipes`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setRecipes(data);
    } catch (err) {
      setError("Failed to load recipes. Please make sure the Flask server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const allRecipes = useMemo(() => [...recipes.free, ...recipes.premium], [recipes]);

  const fuseOptions = {
    keys: [
      { name: "title", weight: 0.7 },
      { name: "desc", weight: 0.3 },
    ],
    threshold: 0.4,
    distance: 100,
    minMatchCharLength: 2,
    includeScore: true,
    ignoreLocation: true,
    findAllMatches: true,
  };

  const fuse = useMemo(() => new Fuse(allRecipes, fuseOptions), [allRecipes]);

  const filteredRecipes = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const results = fuse.search(searchQuery.trim());
    return results.map((result) => result.item);
  }, [searchQuery, fuse]);

  const handleVoiceResult = (voiceText) => {
    setSearchQuery(voiceText);
    setIsVoiceModalOpen(false);
  };

  const handleVoiceSearch = () => {
    setIsVoiceModalOpen(true);
  };

  const renderSearchResults = () => {
    if (filteredRecipes === null) return null;
    if (filteredRecipes.length === 0)
      return (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4 text-6xl">🔍</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No recipes found</h3>
          <p className="text-gray-500">Try different keywords or use voice search.</p>
        </div>
      );
    return (
      <section className="mb-12">
        <h2 className="font-bold text-2xl mb-6 text-gray-800">Search Results ({filteredRecipes.length} found)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} {...recipe} />
          ))}
        </div>
      </section>
    );
  };

  const renderDefaultSections = () => {
    if (filteredRecipes !== null) return null;
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-2xl text-gray-800 flex items-center gap-2">
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">FREE</span> 
              Recipes ({recipes.free.length})
            </h2>
            <Link 
              to="/free-recipes" 
              className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1 hover:underline"
            >
              View All
              <span className="text-lg">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {recipes.free.slice(0, 2).map((recipe) => (
              <RecipeCard key={recipe.id} {...recipe} />
            ))}
          </div>
        </section>
        
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-2xl text-gray-800 flex items-center gap-2">
              <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">PREMIUM</span> 
              Recipes ({recipes.premium.length})
            </h2>
            <Link 
              to="/premium-recipes" 
              className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center gap-1 hover:underline"
            >
              View All
              <span className="text-lg">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {recipes.premium.slice(0, 2).map((recipe) => (
              <RecipeCard key={recipe.id} {...recipe} />
            ))}
          </div>
        </section>
      </div>
    );
  };

  if (loading) return <AppLoadingSpinner />;
  if (error) return <AppErrorMessage message={error} onRetry={fetchRecipes} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} onVoiceSearch={handleVoiceSearch} />
      <Hero />

      <main className="max-w-7xl mx-auto px-4 py-10">
        {renderSearchResults()}
        {renderDefaultSections()}

        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <h2 className="font-bold text-2xl mb-3">Upload Your Recipe</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Join our community and share your culinary creations with the world.
          </p>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-semibold transition-colors duration-200">
            Sign Up to Share Your Recipe
          </button>
        </div>
      </main>

      <footer className="bg-white text-gray-500 text-sm text-center py-8 border-t mt-16">
        <div className="flex flex-col md:flex-row gap-4 justify-center mb-4">
          <a href="#" className="hover:text-gray-700 transition-colors">About</a>
          <a href="#" className="hover:text-gray-700 transition-colors">Contact</a>
          <a href="#" className="hover:text-gray-700 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-gray-700 transition-colors">Privacy Policy</a>
        </div>
        <span>©2024 CookBuddy. All rights reserved.</span>
      </footer>

      <VoiceModal isOpen={isVoiceModalOpen} onClose={() => setIsVoiceModalOpen(false)} onVoiceResult={handleVoiceResult} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/recipe/:id" element={<RecipeDetails />} />
        <Route path="/free-recipes" element={<AllFreeRecipes />} />
        <Route path="/premium-recipes" element={<AllPremiumRecipes />} />
      </Routes>
    </Router>
  );
}

export default App;
