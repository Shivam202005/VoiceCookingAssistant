import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (from LocalStorage)
    const checkUser = async () => {
        const storedUserId = localStorage.getItem('user_id');
        
        if (storedUserId) {
            try {
                const res = await fetch(`http://localhost:5000/profile/${storedUserId}`);
                if (res.ok) {
                    const userData = await res.json();
                    setUser(userData);
                } else {
                    // Agar user DB me nahi mila to logout kar do
                    localStorage.removeItem('user_id');
                }
            } catch (error) {
                console.log("Error restoring session:", error);
            }
        }
        setLoading(false);
    };

    checkUser();
  }, []);

  const login = (userData) => {
    setUser(userData);
    // User ID save karo taaki refresh hone par logout na ho
    localStorage.setItem('user_id', userData.user_id);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user_id');
    // Optional: Backend logout call bhi kar sakte ho
    fetch('http://localhost:5000/logout', { method: 'POST' });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};