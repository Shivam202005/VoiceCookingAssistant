import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthForm = ({ onClose }) => {
  const [isSignup, setIsSignup] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(''); // ✅ Success message ke liye
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    const endpoint = isSignup ? '/signup' : '/login';
    
    try {
      // ✅ 127.0.0.1 use kar rahe hain consistent rehne ke liye
      const res = await fetch(`/api${endpoint}`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(formData),
        credentials: 'include' // ✅ Important for Session
      });
      
      const data = await res.json();
      
      if (res.ok) {
        if (isSignup) {
            // 👇 Signup Success: Ab Login page par bhejo
            setIsSignup(false); 
            setSuccessMsg('Account created successfully! Please Login.');
            setFormData({ ...formData, password: '' }); // Password clear kar do safety ke liye
        } else {
            // 👇 Login Success: Home page par bhejo
            login(data.user); 
            onClose();
        }
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      console.error(err);
      setError('Server connection failed.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 font-bold text-xl">&times;</button>

        <h2 className="text-3xl font-bold mb-2 text-center text-gray-800">
          {isSignup ? 'Create Account' : 'Welcome Back'}
        </h2>

        {/* ✅ Success Message Display */}
        {successMsg && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4 text-center">
                {successMsg}
            </div>
        )}

        {/* Error Message Display */}
        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-center">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <input type="text" placeholder="Full Name" value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg" required />
          )}
          
          <input type="email" placeholder="Email Address" value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg" required />

          <input type="password" placeholder="Password" value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg" required />

          <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-bold hover:shadow-lg transition">
            {isSignup ? 'Sign Up' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button type="button" onClick={() => { setIsSignup(!isSignup); setError(''); setSuccessMsg(''); }}
            className="text-orange-600 font-bold hover:underline">
            {isSignup ? 'Login' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;