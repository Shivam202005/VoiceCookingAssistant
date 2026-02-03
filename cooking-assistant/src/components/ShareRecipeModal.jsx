import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = "/api";

export default function ShareRecipeModal({ onClose, onUploadSuccess }) {
  const { user } = useAuth();
  
  // Form States
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [steps, setSteps] = useState('');
  
  // 🔥 IMAGE STATES
  const [imageFile, setImageFile] = useState(null); // File object
  const [previewUrl, setPreviewUrl] = useState(null); // Preview ke liye
  
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(false);

  // Image Select Handler
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Local preview dikhane ke liye
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Arrays convert karo
      const ingredientsArray = ingredients.split('\n').filter(i => i.trim());
      const stepsArray = steps.split('\n').filter(s => s.trim());

      // 🔥 FORM DATA BANAO (File upload ke liye FormData zaroori hai)
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', desc);
      formData.append('cookTime', cookTime);
      formData.append('servings', servings);
      formData.append('is_paid', isPaid);
      
      // Arrays ko JSON string banakar bhejo
      formData.append('ingredients', JSON.stringify(ingredientsArray));
      formData.append('steps', JSON.stringify(stepsArray));

      // Image File append karo
      if (imageFile) {
        formData.append('image', imageFile);
      }

      // API Call
      const token = localStorage.getItem('user'); // Agar token header chahiye (optional based on auth setup)
      
      const response = await fetch(`${API_BASE_URL}/recipes/upload`, {
        method: 'POST',
        // Note: 'Content-Type': 'multipart/form-data' mat lagana, browser khud lagata hai
        body: formData, 
      });

      if (!response.ok) throw new Error('Upload failed');

      alert('Recipe Uploaded Successfully! 🎉');
      onUploadSuccess(); // Refresh list
      onClose(); // Close modal

    } catch (error) {
      console.error(error);
      alert('Error uploading recipe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold">×</button>
        
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Share Your Recipe 🍳</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 📸 IMAGE UPLOAD SECTION */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors">
                <label className="cursor-pointer block">
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange} 
                        className="hidden" 
                    />
                    {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="h-48 mx-auto rounded-lg object-cover shadow-md" />
                    ) : (
                        <div className="text-gray-500">
                            <span className="text-4xl block mb-2">📸</span>
                            <span className="font-semibold">Click to Upload Recipe Photo</span>
                            <p className="text-xs mt-1 text-gray-400">JPG, PNG supported</p>
                        </div>
                    )}
                </label>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Recipe Title</label>
                    <input required type="text" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-300 outline-none" placeholder="e.g. Butter Chicken" value={title} onChange={e => setTitle(e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                    <input type="text" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-300 outline-none" placeholder="Short and tasty description..." value={desc} onChange={e => setDesc(e.target.value)} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Cook Time (mins)</label>
                    <input required type="number" className="w-full p-3 border rounded-lg" placeholder="30" value={cookTime} onChange={e => setCookTime(e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Servings</label>
                    <input required type="number" className="w-full p-3 border rounded-lg" placeholder="2" value={servings} onChange={e => setServings(e.target.value)} />
                </div>
            </div>

            {/* Ingredients & Steps */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Ingredients (One per line)</label>
                <textarea required className="w-full p-3 border rounded-lg h-24" placeholder="2 Onions&#10;1 tsp Salt&#10;500g Chicken" value={ingredients} onChange={e => setIngredients(e.target.value)}></textarea>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Steps (One per line)</label>
                <textarea required className="w-full p-3 border rounded-lg h-24" placeholder="Chop onions.&#10;Fry in pan.&#10;Add spices." value={steps} onChange={e => setSteps(e.target.value)}></textarea>
            </div>

            {/* Premium Toggle */}
            <div className="flex items-center gap-3 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <input type="checkbox" id="premium" className="w-5 h-5 text-orange-500" checked={isPaid} onChange={e => setIsPaid(e.target.checked)} />
                <label htmlFor="premium" className="font-bold text-gray-700 cursor-pointer">Mark as Premium Recipe 🌟</label>
            </div>

            <button disabled={loading} type="submit" className="w-full bg-orange-500 text-white py-4 rounded-full font-bold text-xl hover:bg-orange-600 shadow-lg transition-transform hover:scale-[1.02]">
                {loading ? 'Uploading...' : '🚀 Publish Recipe'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}