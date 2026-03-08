import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // 🔥 LocalStorage se user nikalenge taaki refresh pe logout na ho
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('cookbuddy_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('cookbuddy_user', JSON.stringify(userData)); // Save session
  };

  const logout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (e) {
      console.error("Logout error", e);
    }
    setUser(null);
    localStorage.removeItem('cookbuddy_user'); // Clear session
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);