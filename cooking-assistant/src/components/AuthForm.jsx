import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = "/api";

export default function AuthForm({ onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/login' : '/signup';
    // 🔥 Ab role bhejne ki zarurat nahi, backend khud 'user' set karega
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      login(data.user); // Login the user
      onClose(); // Close Modal
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[999999]">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-fade-in-up">
        <button 
          onClick={onClose}
          className="absolute top-4 right-5 text-gray-400 hover:text-red-500 font-bold text-2xl"
        >
          ✕
        </button>
        
        <h2 className="text-3xl font-black mb-2 text-gray-800 text-center">
          {isLogin ? 'Welcome Back! 👋' : 'Join CookBuddy 🍳'}
        </h2>
        <p className="text-center text-gray-500 mb-6 font-medium">
          {isLogin ? 'Login to continue your cooking journey' : 'Create an account to save and share recipes'}
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm font-bold text-center border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
              <input
                type="text" required value={name} onChange={(e) => setName(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
                placeholder="Chef Sanjeev Kapoor"
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
              placeholder="chef@cookbuddy.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <input
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100 mt-2"
          >
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600 font-medium text-sm">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-orange-600 font-bold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}