// src/components/RecipeDetails.jsx - Super Fast Version
import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:5000";

export default function RecipeDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Voice states
  const [isReading, setIsReading] = useState(false);
  const [currentSection, setCurrentSection] = useState("");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [voiceReady, setVoiceReady] = useState(false);

  const isReadingRef = useRef(false);
  const isVoiceMode = searchParams.get('voice') === 'true';

  // Voice setup
  useEffect(() => {
    const checkVoices = () => {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        console.log("✅ Browser TTS ready with", voices.length, "voices");
        setVoiceReady(true);
        
        const femaleVoices = voices.filter(v => 
          v.name.toLowerCase().includes('female') ||
          v.name.toLowerCase().includes('google')
        );
        console.log("Available female voices:", femaleVoices);
      } else {
        setTimeout(checkVoices, 500);
      }
    };
    
    checkVoices();
    speechSynthesis.onvoiceschanged = checkVoices;
  }, []);

  // Recipe loading
  useEffect(() => {
    async function fetchRecipe() {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/recipe/${id}`);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();
        setRecipe(data);
        console.log("📖 Recipe loaded:", data.title);
      } catch (error) {
        console.log("❌ Recipe fetch error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    
    if (id) fetchRecipe();
  }, [id]);

  // Auto-start from VoiceModal
  useEffect(() => {
    if (isVoiceMode && voiceReady && recipe && !isReadingRef.current) {
      console.log("🎤 Auto-starting from VoiceModal");
      setTimeout(() => {
        startVoiceReading();
      }, 2000);
    }
  }, [isVoiceMode, voiceReady, recipe]);

  // Fast TTS function (minimal delays)
  const speak = (text) => {
    return new Promise((resolve) => {
      if (!isReadingRef.current) {
        resolve();
        return;
      }

      console.log("🔊 TTS:", text.substring(0, 50) + "...");
      setCurrentText(text);
      
      speechSynthesis.cancel();
      
      setTimeout(() => {
        if (!isReadingRef.current) {
          resolve();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;  // Faster speech
        utterance.pitch = 1.0;
        utterance.volume = 1;
        
        // Find Google voice
        const voices = speechSynthesis.getVoices();
        const googleVoice = voices.find(v => 
          v.name.includes('Google') && v.name.includes('Female') && v.name.includes('English')
        );
        
        if (googleVoice) {
          utterance.voice = googleVoice;
          console.log("✅ Voice:", googleVoice.name);
        }
        
        utterance.onstart = () => {
          console.log("✅ TTS Started Successfully");
        };
        
        utterance.onend = () => {
          console.log("✅ TTS Completed");
          resolve();
        };
        
        utterance.onerror = (error) => {
          console.log("❌ TTS Error:", error.error);
          resolve();
        };
        
        try {
          speechSynthesis.speak(utterance);
        } catch (error) {
          console.log("❌ Speak failed:", error);
          resolve();
        }
      }, 100); // Minimal delay
    });
  };

  const startVoiceReading = async () => {
    if (!recipe || isReadingRef.current) return;
    
    console.log("🎤 USER CLICKED - Starting voice reading:", recipe.title);
    
    setIsReading(true);
    isReadingRef.current = true;
    setCurrentSection("intro");
    setCurrentStepIndex(0);
    
    try {
      // Introduction
      await speak(`Welcome to cooking ${recipe.title}. This recipe serves ${recipe.servings} people and takes ${recipe.cookTime}.`);
      if (!isReadingRef.current) return;
      
      // Ingredients - READ ALL OF THEM
      setCurrentSection("ingredients");
      
      if (recipe.ingredients && recipe.ingredients.length > 0) {
        await speak(`You need ${recipe.ingredients.length} ingredients.`);
        if (!isReadingRef.current) return;
        
        // Read ALL ingredients (removed the 5 ingredient limit)
        for (let i = 0; i < recipe.ingredients.length; i++) {
          if (!isReadingRef.current) break;
          
          const ingredient = recipe.ingredients[i];
          await speak(`${i + 1}. ${ingredient}`);
          // No delay between ingredients
        }
        
        await speak("Great! Now let's start cooking.");
      }
      
      if (!isReadingRef.current) return;
      
      // Steps (same as before)
      setCurrentSection("steps");
      await speak(`I'll guide you through ${recipe.steps.length} cooking steps.`);
      if (!isReadingRef.current) return;
      
      if (recipe.steps && recipe.steps.length > 0) {
        for (let i = 0; i < recipe.steps.length; i++) {
          if (!isReadingRef.current) break;
          
          setCurrentStepIndex(i);
          const stepNumber = i + 1;
          const step = recipe.steps[i];
          
          console.log(`📖 Step ${stepNumber}`);
          
          await speak(`Step ${stepNumber}.`);
          if (!isReadingRef.current) break;
          
          await speak(step);
          if (!isReadingRef.current) break;
          
          // Minimal pause between steps
          if (i < recipe.steps.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
        
        if (isReadingRef.current) {
          await speak("Perfect! Your recipe is complete. Enjoy your delicious meal! Have a good day");
        }
      }
      
      setCurrentSection("complete");
      console.log("🎉 Voice reading completed successfully");
      
    } catch (error) {
      console.log("❌ Voice reading error:", error);
    } finally {
      setIsReading(false);
      isReadingRef.current = false;
      setCurrentText("");
    }
  };
  

  const stopReading = () => {
    console.log("⏹️ User manually stopped voice");
    setIsReading(false);
    isReadingRef.current = false;
    setCurrentSection("");
    setCurrentText("");
    speechSynthesis.cancel();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h3 className="text-2xl font-semibold text-gray-600 mb-2">Recipe Not Found</h3>
          <Link to="/" className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full">
            🏠 Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!recipe) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link to="/" className="inline-flex items-center gap-2 mb-8 text-green-600 hover:text-green-700 font-medium">
          ← Back to Recipes
        </Link>

        {/* Voice Control Panel */}
        <div className="mb-8 p-6 bg-white rounded-2xl shadow-xl border-2 border-green-200">
          <div className="text-center">
            <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center transition-all ${
              isReading ? 'bg-green-500 animate-pulse shadow-2xl' : 
              voiceReady ? 'bg-blue-500 shadow-lg' : 'bg-gray-400'
            }`}>
              <span className="text-white text-3xl">
                {isReading ? '🔊' : voiceReady ? '🎤' : '⏳'}
              </span>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {isReading ? '🗣️ Fast Voice Guide Active' : 
               voiceReady ? '🎤 Fast Voice Guide Ready' : 
               '⏳ Loading Voice...'}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {currentSection === "intro" && "Reading introduction..."}
              {currentSection === "ingredients" && "Reading ingredients..."}
              {currentSection === "steps" && `Reading step ${currentStepIndex + 1}...`}
              {currentSection === "complete" && "Recipe complete! 🎉"}
              {!currentSection && voiceReady && "Click to start FAST voice cooking guide"}
            </p>
            
            {/* Currently Speaking */}
            {currentText && (
              <div className="mb-6 p-4 bg-green-50 rounded-lg border-2 border-green-300">
                <p className="text-green-600 font-bold mb-2">🔊 Speaking:</p>
                <p className="text-green-800 font-medium">{currentText}</p>
              </div>
            )}
            
            {/* Controls */}
            <div className="flex justify-center gap-4">
              {!isReading && voiceReady && (
                <button
                  onClick={startVoiceReading}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-xl shadow-2xl transition-all"
                >
                  🔊 Start  Voice Guide
                </button>
              )}
              
              {isReading && (
                <button
                  onClick={stopReading}
                  className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-bold text-xl shadow-2xl transition-all"
                >
                  ⏹️ Stop Voice
                </button>
              )}
            </div>
          </div>
          
          {/* Progress */}
          {currentSection === "steps" && recipe.steps && (
            <div className="mt-6">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-green-500 h-4 rounded-full transition-all duration-500" 
                  style={{width: `${((currentStepIndex + 1) / recipe.steps.length) * 100}%`}}
                ></div>
              </div>
              <p className="text-gray-600 mt-2 text-center font-bold">
                Step {currentStepIndex + 1} of {recipe.steps.length}
              </p>
            </div>
          )}
        </div>

        {/* Recipe Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="h-80 overflow-hidden">
            <img 
              src={recipe.img || "/images/f1.jpeg"}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{recipe.title}</h1>
            <p className="text-xl text-gray-600 mb-6">{recipe.desc?.replace(/<[^>]*>/g, '')}</p>

            <div className="grid grid-cols-3 gap-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
              <div className="text-center">
                <div className="text-3xl text-orange-600 mb-2">⏰</div>
                <h3 className="font-bold">Cook Time</h3>
                <p className="text-lg">{recipe.cookTime}</p>
              </div>
              <div className="text-center">
                <div className="text-3xl text-blue-600 mb-2">👥</div>
                <h3 className="font-bold">Servings</h3>
                <p className="text-lg">{recipe.servings}</p>
              </div>
              <div className="text-center">
                <div className="text-3xl text-green-600 mb-2">📊</div>
                <h3 className="font-bold">Difficulty</h3>
                <p className="text-lg">{recipe.difficulty}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ingredients */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div className={`mt-8 bg-white rounded-2xl shadow-xl p-8 transition-all duration-500 ${
            currentSection === "ingredients" ? 'ring-4 ring-green-400 bg-green-50' : ''
          }`}>
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              🥘 Ingredients ({recipe.ingredients.length})
              {currentSection === "ingredients" && (
                <span className="text-green-500 animate-pulse">🔊 Reading...</span>
              )}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recipe.ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <span className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  <span className="font-medium">{ingredient}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Steps */}
        {recipe.steps && recipe.steps.length > 0 && (
          <div className={`mt-8 bg-white rounded-2xl shadow-xl p-8 transition-all duration-500 ${
            currentSection === "steps" ? 'ring-4 ring-green-400' : ''
          }`}>
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              📋 Cooking Steps ({recipe.steps.length})
              {currentSection === "steps" && (
                <span className="text-green-500 animate-pulse">🔊 Step {currentStepIndex + 1}...</span>
              )}
            </h2>
            <div className="space-y-6">
              {recipe.steps.map((step, index) => (
                <div 
                  key={index} 
                  className={`flex gap-4 p-6 rounded-xl transition-all duration-500 ${
                    currentSection === "steps" && currentStepIndex === index 
                      ? 'bg-green-50 border-4 border-green-400 shadow-2xl scale-105' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                      currentSection === "steps" && currentStepIndex === index 
                        ? 'bg-green-500 animate-bounce shadow-2xl scale-125' 
                        : 'bg-orange-500'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 pt-3">
                    <p className="text-gray-700 leading-relaxed text-lg">{step}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
