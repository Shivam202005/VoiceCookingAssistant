// src/App.jsx - COMPLETE FIXED VERSION
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

const API_BASE_URL = "http://127.0.0.1:5000"; 

function AppLoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-6"></div>
        <p className="text-gray-600 font-medium text-lg">Loading delicious recipes...</p>
        <p className="text-gray-500 text-sm mt-2">Fetching from our database of 59+ recipes</p>
      </div>
    </div>
  );
}

function AppErrorMessage({ message, onRetry }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="text-red-400 mb-6 text-6xl">⚠️</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Oops! Something went wrong</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-semibold transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

function Homepage() {
  const { user, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [recipes, setRecipes] = useState({ free: [], premium: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/recipes`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      // FIX: Backend bhejta hai flat array, hum separate karte hain
      const freeRecipes = data.filter(r => r.tag === 'FREE');
      const premiumRecipes = data.filter(r => r.tag === 'PREMIUM');
      setRecipes({ free: freeRecipes, premium: premiumRecipes });

      const statsResponse = await fetch(`${API_BASE_URL}/stats`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (err) {
      setError("Failed to load recipes. Please make sure the Flask server is running on port 5000.");
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
    threshold: 0.3,
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
        <div className="text-center py-20">
          <div className="text-gray-400 mb-6 text-8xl">🔍</div>
          <h3 className="text-2xl font-semibold text-gray-600 mb-4">No recipes found</h3>
          <p className="text-gray-500 text-lg">Try different keywords or use voice search.</p>
          <button
            onClick={() => setSearchQuery("")}
            className="mt-4 text-orange-600 hover:text-orange-700 font-medium underline"
          >
            Clear search and see all recipes
          </button>
        </div>
      );
    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-bold text-3xl mb-2 text-gray-800">Search Results</h2>
            <p className="text-gray-600">
              Found <span className="font-semibold text-orange-600">{filteredRecipes.length}</span> recipes matching "{searchQuery}"
            </p>
          </div>
          <button
            onClick={() => setSearchQuery("")}
            className="text-gray-500 hover:text-gray-700 underline"
          >
            Clear search
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRecipes.slice(0, 20).map((recipe) => (
            <RecipeCard key={recipe.id} {...recipe} />
          ))}
        </div>
        {filteredRecipes.length > 20 && (
          <div className="text-center mt-8">
            <p className="text-gray-500">Showing first 20 results of {filteredRecipes.length} found</p>
          </div>
        )}
      </section>
    );
  };

  const renderDefaultSections = () => {
    if (filteredRecipes !== null) return null;
    return (
      <>
        {stats && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-xl mb-12 text-center">
            <h2 className="text-2xl font-bold mb-2">🍽️ Recipe Database Loaded!</h2>
            <p className="text-lg opacity-90">
              Now serving <span className="font-bold text-yellow-200">{stats.total_recipes}</span> professional recipes
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          <section>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-bold text-3xl text-gray-800 flex items-center gap-3 mb-2">
                  <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-lg font-bold">FREE</span>
                  Recipes
                </h2>
                <p className="text-gray-600">
                  <span className="font-semibold">{recipes.free.length}</span> free recipes available
                </p>
              </div>
              <Link
                to="/free-recipes"
                className="text-green-600 hover:text-green-700 font-medium flex items-center gap-2 hover:underline bg-green-50 px-4 py-2 rounded-full transition-colors"
              >
                View All ({recipes.free.length})
                <span className="text-xl">→</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {recipes.free.slice(0, 4).map((recipe) => (
                <RecipeCard key={recipe.id} {...recipe} />
              ))}
            </div>
            {recipes.free.length > 4 && (
              <div className="mt-6 text-center">
                <Link
                  to="/free-recipes"
                  className="text-green-600 hover:text-green-700 font-medium underline"
                >
                  +{recipes.free.length - 4} more free recipes
                </Link>
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-bold text-3xl text-gray-800 flex items-center gap-3 mb-2">
                  <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-lg font-bold">PREMIUM</span>
                  Recipes
                </h2>
                <p className="text-gray-600">
                  <span className="font-semibold">{recipes.premium.length}</span> premium recipes available
                </p>
              </div>
              <Link
                to="/premium-recipes"
                className="text-orange-600 hover:text-orange-700 font-medium flex items-center gap-2 hover:underline bg-orange-50 px-4 py-2 rounded-full transition-colors"
              >
                View All ({recipes.premium.length})
                <span className="text-xl">→</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {recipes.premium.slice(0, 4).map((recipe) => (
                <RecipeCard key={recipe.id} {...recipe} />
              ))}
            </div>
            {recipes.premium.length > 4 && (
              <div className="mt-6 text-center">
                <Link
                  to="/premium-recipes"
                  className="text-orange-600 hover:text-orange-700 font-medium underline"
                >
                  +{recipes.premium.length - 4} more premium recipes
                </Link>
              </div>
            )}
          </section>
        </div>
      </>
    );
  };

  if (loading) return <AppLoadingSpinner />;
  if (error) return <AppErrorMessage message={error} onRetry={fetchRecipes} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} onVoiceSearch={handleVoiceSearch} />
      <Hero />

      <main className="max-w-7xl mx-auto px-4 py-12">
        {renderSearchResults()}
        {renderDefaultSections()}

        <div className="text-center py-16 bg-white rounded-xl shadow-lg">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-bold text-3xl mb-4 text-gray-800">Share Your Recipe</h2>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              Join our community of food lovers and share your culinary creations with the world!
            </p>
            {user ? (
              <button className="bg-green-500 hover:bg-green-600 text-white px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all">
                Share Your Own Recipe (Coming Soon)
              </button>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-10 py-4 rounded-full font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Sign Up to Share Your Recipe
              </button>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white text-gray-500 text-sm text-center py-12 border-t mt-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6 justify-center mb-8">
            <a href="#" className="hover:text-gray-700 transition-colors">About</a>
            <a href="#" className="hover:text-gray-700 transition-colors">Contact</a>
            <a href="#" className="hover:text-gray-700 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gray-700 transition-colors">Privacy Policy</a>
          </div>
          <div className="border-t border-gray-200 pt-8">
            <p className="mb-2">©2025 CookBuddy. All Rights reserved.</p>
            {stats && (
              <p className="text-xs text-gray-400">
                Powered by {stats.total_recipes} Professional recipes • Database Status: {stats.status}
              </p>
            )}
          </div>
        </div>
      </footer>

      {showAuth && <AuthForm onClose={() => setShowAuth(false)} />}

      <VoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onVoiceResult={handleVoiceResult}
      />
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
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
