import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

// 🔥 Dictionary for static texts
export const translations = {
  en: {
    cookBuddy: "CookBuddy",
    searchPlaceholder: "Search for recipes...",
    askAI: "Ask AI",
    upload: "Upload",
    login: "Login",
    signup: "Sign Up",
    logout: "Logout",
    filters: "Filters",
    country: "Country",
    state: "State",
    allRecipes: "All Recipes",
    noRecipesFound: "No recipes found. Try searching something else!"
  },
  hi: {
    cookBuddy: "कुकबडी",
    searchPlaceholder: "रेसिपी खोजें...",
    askAI: "AI से पूछें",
    upload: "अपलोड करें",
    login: "लॉगिन",
    signup: "साइन अप",
    logout: "लॉगआउट",
    filters: "फ़िल्टर",
    country: "देश",
    state: "राज्य",
    allRecipes: "सभी रेसिपी",
    noRecipesFound: "कोई रेसिपी नहीं मिली। कुछ और खोजने का प्रयास करें!"
  },
  mr: {
    cookBuddy: "कुकबडी",
    searchPlaceholder: "रेसिपी शोधा...",
    askAI: "AI ला विचारा",
    upload: "अपलोड करा",
    login: "लॉगिन",
    signup: "साइन अप",
    logout: "लॉगआउट",
    filters: "फिल्टर",
    country: "देश",
    state: "राज्य",
    allRecipes: "सर्व रेसिपी",
    noRecipesFound: "कोणतीही रेसिपी सापडली नाही. दुसरे काहीतरी शोधून पहा!"
  }
};

export const LanguageProvider = ({ children }) => {
  // 🔥 LocalStorage se language nikalenge taaki refresh par change na ho
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('cookbuddy_lang') || 'en';
  });

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('cookbuddy_lang', lang);
  };

  // 🔥 Translation Function 't'
  const t = (key) => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);