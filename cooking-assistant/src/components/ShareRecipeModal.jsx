import React, { useState } from "react";

const API_BASE_URL = "/api";

export default function ShareRecipeModal({ onClose }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [image, setImage] = useState(null);
  
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("cookTime", cookTime);
      formData.append("servings", servings);
      
      const ingArray = ingredients.split("\n").filter(i => i.trim() !== "");
      const stepArray = steps.split("\n").filter(s => s.trim() !== "");
      
      formData.append("ingredients", JSON.stringify(ingArray));
      formData.append("steps", JSON.stringify(stepArray));
      
      if (image) {
        formData.append("image", image);
      }

      const response = await fetch(`${API_BASE_URL}/recipes/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      alert("Recipe uploaded successfully! 🎉");
      window.location.reload(); // Page refresh karke nayi dish dikhane ke liye
      onClose();

    } catch (error) {
      console.error(error);
      alert("Error uploading recipe. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[999999]">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-red-500 font-bold text-2xl"
        >
          ✕
        </button>
        
        <h2 className="text-3xl font-black mb-6 text-gray-800">🧑‍🍳 Share Your Recipe</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Recipe Title</label>
            <input 
              required type="text" value={title} onChange={e => setTitle(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
              placeholder="E.g. Masala Dosa"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Short Description</label>
            <input 
              type="text" value={description} onChange={e => setDescription(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
              placeholder="A brief taste of what this is..."
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-1">Cook Time (mins)</label>
              <input 
                required type="number" value={cookTime} onChange={e => setCookTime(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
                placeholder="30"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-1">Servings</label>
              <input 
                required type="number" value={servings} onChange={e => setServings(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
                placeholder="4"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Ingredients (One per line)</label>
            <textarea 
              required rows="4" value={ingredients} onChange={e => setIngredients(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
              placeholder="2 cups rice&#10;1 tsp salt..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Steps (One per line)</label>
            <textarea 
              required rows="4" value={steps} onChange={e => setSteps(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
              placeholder="1. Wash the rice&#10;2. Boil water..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Upload Image</label>
            <input 
              type="file" accept="image/*" onChange={handleImageChange}
              className="w-full p-2 border border-dashed border-gray-300 rounded-xl bg-gray-50 cursor-pointer"
            />
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100"
          >
            {loading ? "Uploading..." : "Share Recipe 🚀"}
          </button>
        </form>
      </div>
    </div>
  );
}