// src/App.jsx - Complete corrected code
import React, { useState, useMemo } from "react";
import Fuse from 'fuse.js';
import 'regenerator-runtime/runtime';
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import RecipeCard from "./components/RecipeCard";
import VoiceModal from "./components/VoiceModal";

// ✅ Move constants OUTSIDE component or at the TOP of component
const FREE_RECIPES = [
  { 
    id: 1,
    title: "Savory Herb-Crusted Salmon", 
    desc: "A healthy and flavorful salmon dish with fresh herbs and crispy coating. Perfect for dinner.", 
    img: "https://images.unsplash.com/photo-1516685018646-5499d0a6dbdf?w=400", 
    tag: "FREE" 
  },
  { 
    id: 2,
    title: "Spicy Thai Peanut Noodles", 
    desc: "A quick and easy noodle recipe with authentic Thai flavors and creamy peanut sauce.", 
    img: "https://images.unsplash.com/photo-1464306076886-deb9eb240a65?w=400", 
    tag: "FREE" 
  },
];

const PREMIUM_RECIPES = [
  { 
    id: 3,
    title: "Mediterranean Quinoa Salad", 
    desc: "A refreshing and nutritious salad packed with Mediterranean vegetables and quinoa.", 
    img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400", 
    tag: "PREMIUM" 
  },
  { 
    id: 4,
    title: "Creamy Avocado Pasta", 
    desc: "A rich and creamy pasta dish made with fresh avocados and aromatic herbs.", 
    img: "https://images.unsplash.com/photo-1523983303491-8c8f7dd0b13e?w=400", 
    tag: "PREMIUM" 
  },
];

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  // ✅ Now useMemo can access the constants
  const allRecipes = useMemo(() => {
    return [...FREE_RECIPES, ...PREMIUM_RECIPES];
  }, []);

  // Fuse.js configuration for fuzzy search
  const fuseOptions = {
    keys: [
      { name: 'title', weight: 0.7 },
      { name: 'desc', weight: 0.3 }
    ],
    threshold: 0.4,           // 0.0 = perfect match, 1.0 = match anything
    distance: 100,
    minMatchCharLength: 2,
    includeScore: true,
    ignoreLocation: true,
    findAllMatches: true
  };

  const fuse = useMemo(() => new Fuse(allRecipes, fuseOptions), [allRecipes]);

  // Enhanced fuzzy search with Fuse.js
  const filteredRecipes = useMemo(() => {
    if (!searchQuery.trim()) {
      return null;
    }
    
    const results = fuse.search(searchQuery.trim());
    return results.map(result => result.item);
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
    
    if (filteredRecipes.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.007-5.824-2.448M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No recipes found</h3>
          <p className="text-gray-500">Try different keywords or use voice search.</p>
        </div>
      );
    }

    return (
      <section className="mb-12">
        <h2 className="font-bold text-2xl mb-6">
          Search Results ({filteredRecipes.length} found)
        </h2>
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
          <h2 className="font-bold text-2xl mb-6">Free Recipes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FREE_RECIPES.map((recipe) => (
              <RecipeCard key={recipe.id} {...recipe} />
            ))}
          </div>
        </section>
        
        <section>
          <h2 className="font-bold text-2xl mb-6">Premium Recipes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {PREMIUM_RECIPES.map((recipe) => (
              <RecipeCard key={recipe.id} {...recipe} />
            ))}
          </div>
        </section>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery}
        onVoiceSearch={handleVoiceSearch}
      />
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

      <VoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onVoiceResult={handleVoiceResult}
      />
    </div>
  );
}

export default App;
