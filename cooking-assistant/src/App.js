// src/App.js - Make sure this route exists
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import RecipeDetails from "./components/RecipeDetails"; // Import check

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recipe/:id" element={<RecipeDetails />} />
          {/* Make sure this route exists */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
