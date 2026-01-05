import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
        const storedUserId = localStorage.getItem('user_id');
        
        // "undefined" string check karna zaroori hai kyunki localStorage kabhi kabhi string save kar leta hai
        if (storedUserId && storedUserId !== 'undefined' && storedUserId !== 'null') {
            try {
                // 🔥 URL sirf 127.0.0.1 hona chahiye
                const res = await fetch(`/api/profile/${storedUserId}`, {
                    credentials: 'include' 
                });
                
                if (res.ok) {
                    const userData = await res.json();
                    setUser(userData);
                } else {
                    // Agar session invalid hai to safai karo
                    localStorage.removeItem('user_id');
                    setUser(null);
                }
            } catch (error) {
                console.log("Session restore failed:", error);
            }
        }
        setLoading(false);
    };

    checkUser();
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user_id', userData.user_id || userData.id);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user_id');
    fetch('/api/logout', { 
        method: 'POST',
        credentials: 'include'
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};