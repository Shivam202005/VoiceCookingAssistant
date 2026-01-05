import React, { useState } from 'react';

export default function ShareRecipeModal({ onClose, onUploadSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cookTime: '',
    servings: '',
    difficulty: 'Easy',
    is_paid: false,
    image_url: ''
  });

  const [ingredients, setIngredients] = useState(['']);
  const [steps, setSteps] = useState(['']);
  const [loading, setLoading] = useState(false);

  const handleAddIngredient = () => setIngredients([...ingredients, '']);
  const handleAddStep = () => setSteps([...steps, '']);

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const handleStepChange = (index, value) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const recipeData = {
      ...formData,
      ingredients: ingredients.filter(i => i.trim() !== ''),
      steps: steps.filter(s => s.trim() !== '')
    };

    try {
      // 👇 CHANGE IS HERE: URL aur credentials
      const response = await fetch('/api/recipes/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipeData),
        credentials: 'include' // 🔥 YE LINE SABSE ZAROORI HAI (Iske bina upload nahi hoga)
      });

      if (response.ok) {
        alert('Recipe Uploaded Successfully! 🎉');
        onUploadSuccess(); // List refresh karega
        onClose();
      } else {
        const data = await response.json();
        alert('Failed to upload: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Server error. Is backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 overflow-y-auto py-10">
      <div className="bg-white rounded-2xl w-full max-w-2xl m-4 p-6 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl font-bold">×</button>
        
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">🍳 Share Your Recipe</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required type="text" placeholder="Recipe Title (e.g. Paneer Tikka)" className="p-3 border rounded-lg w-full"
              onChange={e => setFormData({...formData, title: e.target.value})} />
            
            <select className="p-3 border rounded-lg w-full"
              onChange={e => setFormData({...formData, difficulty: e.target.value})}>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <textarea required placeholder="Short Description..." className="p-3 border rounded-lg w-full h-24"
            onChange={e => setFormData({...formData, description: e.target.value})} />

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input required type="number" placeholder="Cook Time (mins)" className="p-3 border rounded-lg w-full"
              onChange={e => setFormData({...formData, cookTime: e.target.value})} />
            
            <input required type="number" placeholder="Servings" className="p-3 border rounded-lg w-full"
              onChange={e => setFormData({...formData, servings: e.target.value})} />
              
            <input type="text" placeholder="Image URL (Optional)" className="p-3 border rounded-lg w-full"
              onChange={e => setFormData({...formData, image_url: e.target.value})} />
          </div>

          {/* Type Selector */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border">
            <span className="font-bold text-gray-700">Recipe Type:</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="type" checked={!formData.is_paid} onChange={() => setFormData({...formData, is_paid: false})} />
              <span className="text-green-600 font-bold">Free</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="type" checked={formData.is_paid} onChange={() => setFormData({...formData, is_paid: true})} />
              <span className="text-orange-600 font-bold">Premium (Paid)</span>
            </label>
          </div>

          {/* Ingredients */}
          <div>
            <h3 className="font-bold mb-2">Ingredients</h3>
            {ingredients.map((ing, i) => (
              <input key={i} type="text" value={ing} placeholder={`Ingredient ${i+1}`} 
                className="p-2 border rounded-lg w-full mb-2"
                onChange={(e) => handleIngredientChange(i, e.target.value)} />
            ))}
            <button type="button" onClick={handleAddIngredient} className="text-sm text-blue-600 font-semibold">+ Add Ingredient</button>
          </div>

          {/* Steps */}
          <div>
            <h3 className="font-bold mb-2">Cooking Steps</h3>
            {steps.map((step, i) => (
              <textarea key={i} value={step} placeholder={`Step ${i+1}`} 
                className="p-2 border rounded-lg w-full mb-2"
                onChange={(e) => handleStepChange(i, e.target.value)} />
            ))}
            <button type="button" onClick={handleAddStep} className="text-sm text-blue-600 font-semibold">+ Add Step</button>
          </div>

          <button disabled={loading} type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold text-xl shadow-lg transition-all">
            {loading ? 'Uploading...' : '🚀 Publish Recipe'}
          </button>

        </form>
      </div>
    </div>
  );
}