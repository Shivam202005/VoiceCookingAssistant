import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import RecipeCard from "./components/RecipeCard";

const FREE_RECIPES = [
  { title: "Savory Herb-Crusted Salmon", desc: "A healthy and flavorful salmon dish.", img: "https://images.unsplash.com/photo-1516685018646-5499d0a6dbdf", tag: "FREE" },
  { title: "Spicy Thai Peanut Noodles", desc: "A quick and easy noodle recipe.", img: "https://images.unsplash.com/photo-1464306076886-deb9eb240a65", tag: "FREE" },
];

const PREMIUM_RECIPES = [
  { title: "Mediterranean Quinoa Salad", desc: "A refreshing and nutritious salad.", img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836", tag: "PREMIUM" },
  { title: "Creamy Avocado Pasta", desc: "A rich and creamy pasta dish.", img: "https://images.unsplash.com/photo-1523983303491-8c8f7dd0b13e", tag: "PREMIUM" },
];

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Hero />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Free */}
          <section>
            <h2 className="font-bold text-2xl mb-4">Free Recipes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {FREE_RECIPES.map((r, idx) => <RecipeCard key={idx} {...r} />)}
            </div>
          </section>
          {/* Premium */}
          <section>
            <h2 className="font-bold text-2xl mb-4">Premium Recipes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {PREMIUM_RECIPES.map((r, idx) => <RecipeCard key={idx} {...r} />)}
            </div>
          </section>
        </div>
        {/* Upload CTA */}
        <div className="text-center py-12 bg-white rounded-lg shadow mb-16">
          <h2 className="font-bold text-xl mb-2">Upload Your Recipe</h2>
          <p className="text-gray-600 mb-5">Join our community and share your culinary creations with the world.</p>
          <button className="bg-orange-500 text-white px-6 py-3 rounded-full font-semibold">
            Sign Up to Share Your Recipe
          </button>
        </div>
      </main>
      <footer className="bg-white text-gray-500 text-sm text-center py-6 border-t">
        <div className="flex flex-col md:flex-row gap-2 justify-center mb-2">
          <span>About</span>
          <span>Contact</span>
          <span>Terms of Service</span>
          <span>Privacy Policy</span>
        </div>
        <span>©2024 CookBuddy. All rights reserved.</span>
      </footer>
    </div>
  );
}
export default App;
