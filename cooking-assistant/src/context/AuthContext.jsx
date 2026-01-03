import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      fetch(`http://localhost:5000/profile/${userId}`)
        .then(res => res.json())
        .then(data => setUser(data))
        .catch(() => localStorage.removeItem('user_id'));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user_id', userData.user_id);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user_id');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
