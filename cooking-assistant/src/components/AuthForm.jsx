import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthForm = ({ onClose }) => {
  const [isSignup, setIsSignup] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isSignup ? '/signup' : '/login';
    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        login(data);
        onClose();
      } else {
        alert(data.error || 'Error!');
      }
    } catch (err) {
      alert('Network error!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isSignup ? 'Sign Up' : 'Login'}
        </h2>
        <form onSubmit={handleSubmit}>
          {isSignup && (
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full p-3 border rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600"
          >
            {isSignup ? 'Sign Up' : 'Login'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          {isSignup ? 'Already have account?' : "Don't have account?"}{' '}
          <button
            type="button"
            onClick={() => setIsSignup(!isSignup)}
            className="text-blue-500 font-semibold"
          >
            {isSignup ? 'Login' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
