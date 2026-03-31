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
  const [errorMsg, setErrorMsg] = useState(""); // Errors dikhane ke liye state

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(""); // Purane errors clear karo

    // 🔥 STRICT VALIDATION START
    const ingArray = ingredients.split("\n").filter(i => i.trim() !== "");
    const stepArray = steps.split("\n").filter(s => s.trim() !== "");

    // 1. Title Validation (Compulsory)
    if (!title.trim()) {
      setErrorMsg("Recipe Title likhna compulsory hai!");
      return;
    }
    // 2. Description Validation
    if (!description.trim()) {
      setErrorMsg("Short Description likhna zaruri hai!");
      return;
    }
    // 3. Ingredients Validation
    if (ingArray.length < 2) {
      setErrorMsg("Kam se kam 2 ingredients (samagri) likhna zaruri hai.");
      return;
    }
    // 4. Steps Validation
    if (stepArray.length < 2) {
      setErrorMsg("Kam se kam 2 steps (banane ki vidhi) likhna zaruri hai.");
      return;
    }
    // 5. Image Validation
    if (!image) {
      setErrorMsg("Bina photo ke recipe approve nahi hogi! Ek clear image upload karein.");
      return;
    }
    // 🔥 STRICT VALIDATION END

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("cookTime", cookTime);
      formData.append("servings", servings);
      
      formData.append("ingredients", JSON.stringify(ingArray));
      formData.append("steps", JSON.stringify(stepArray));
      formData.append("image", image);

      const response = await fetch(`${API_BASE_URL}/recipes/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      alert("Recipe uploaded successfully! 🎉 It will be reviewed by the Admin soon.");
      window.location.reload(); 
      onClose();

    } catch (error) {
      console.error(error);
      setErrorMsg("Server error! Recipe upload nahi ho payi. Please check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[999999]">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-red-500 font-bold text-2xl transition-colors"
        >
          ✕
        </button>
        
        <h2 className="text-3xl font-black mb-4 text-gray-800">🧑‍🍳 Share Your Recipe</h2>
        
        {/* 🔥 APPROVAL GUIDELINES BOX */}
        <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl">
          <h3 className="text-blue-800 font-bold mb-2 flex items-center gap-2">
            📋 Guidelines for Approval
          </h3>
          <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
            <li><strong>Recipe Title</strong> is strictly mandatory.</li>
            <li>Provide at least <strong>2 Ingredients</strong> & <strong>2 Steps</strong>.</li>
            <li>A clear, mouth-watering <strong>Image is required</strong>.</li>
            <li>Incomplete recipes will be <strong>rejected</strong> by the Admin.</li>
          </ul>
        </div>

        {/* 🔥 ERROR MESSAGE SHOW KARNE KE LIYE */}
        {errorMsg && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-3 rounded-r-xl text-red-700 font-bold text-sm animate-pulse flex items-center gap-2">
            <span className="text-lg">⚠️</span> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Recipe Title <span className="text-red-500">*</span></label>
            <input 
              required type="text" value={title} onChange={e => setTitle(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
              placeholder="E.g. Authentic Masala Dosa"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Short Description <span className="text-red-500">*</span></label>
            <input 
              required type="text" value={description} onChange={e => setDescription(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
              placeholder="A brief taste of what this is..."
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-1">Cook Time (mins) <span className="text-red-500">*</span></label>
              <input 
                required type="number" min="1" value={cookTime} onChange={e => setCookTime(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
                placeholder="30"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-1">Servings <span className="text-red-500">*</span></label>
              <input 
                required type="number" min="1" value={servings} onChange={e => setServings(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
                placeholder="4"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Ingredients (One per line) <span className="text-red-500">*</span></label>
            <textarea 
              required rows="4" value={ingredients} onChange={e => setIngredients(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
              placeholder="2 cups rice&#10;1 tsp salt..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Steps (One per line) <span className="text-red-500">*</span></label>
            <textarea 
              required rows="4" value={steps} onChange={e => setSteps(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
              placeholder="1. Wash the rice&#10;2. Boil water..."
            />
          </div>

          <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
            <label className="block text-sm font-bold text-orange-800 mb-2 flex items-center gap-2">
              📸 Upload Recipe Image <span className="text-red-500">*</span>
            </label>
            <input 
              type="file" accept="image/*" onChange={handleImageChange}
              className="w-full p-2 border border-dashed border-orange-300 rounded-xl bg-white cursor-pointer text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200"
            />
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100 mt-2"
          >
            {loading ? "Uploading to Server..." : "Submit for Approval 🚀"}
          </button>
        </form>
      </div>
    </div>
  );
}