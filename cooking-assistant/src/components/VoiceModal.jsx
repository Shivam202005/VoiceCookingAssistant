// VoiceModal.jsx - Enhanced Voice Recognition
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "/api";

export default function VoiceModal({ isOpen, onClose }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentRecipeIndex, setCurrentRecipeIndex] = useState(0);
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
  const [message, setMessage] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const speakingRef = useRef(false);
  const modalOpenRef = useRef(false);
  const waitingForConfirmationRef = useRef(false);
  const currentRecipeRef = useRef(null);
  const searchResultsRef = useRef([]);
  const currentIndexRef = useRef(0);

  useEffect(() => {
    modalOpenRef.current = isOpen;
    
    if (isOpen) {
      console.log("🚀 VoiceModal opened");
      resetState();
      setTimeout(() => {
        startInitialFlow();
      }, 1000);
    } else {
      cleanup();
    }
  }, [isOpen]);

  useEffect(() => {
    waitingForConfirmationRef.current = waitingForConfirmation;
    console.log("🔄 Confirmation state updated:", waitingForConfirmation);
  }, [waitingForConfirmation]);

  useEffect(() => {
    searchResultsRef.current = searchResults;
    currentIndexRef.current = currentRecipeIndex;
    
    if (searchResults.length > 0 && currentRecipeIndex < searchResults.length) {
      currentRecipeRef.current = searchResults[currentRecipeIndex];
      console.log("📝 Recipe updated:", currentRecipeRef.current?.title, "| ID:", currentRecipeRef.current?.id, "| Index:", currentRecipeIndex, "/", searchResults.length);
    }
  }, [searchResults, currentRecipeIndex]);

  useEffect(() => {
    if (!recognitionRef.current && typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.maxAlternatives = 5; // More alternatives for better matching

      recognitionRef.current.onresult = (event) => {
        const results = event.results[0];
        const text = results[0].transcript.toLowerCase().trim();
        const confidence = results[0].confidence;
        
        // Get all alternatives for better matching
        const alternatives = [];
        for (let i = 0; i < results.length; i++) {
          alternatives.push(results[i].transcript.toLowerCase().trim());
        }
        
        setTranscript(text);
        console.log("🎤 User said:", text, "| Confidence:", confidence, "| Waiting ref:", waitingForConfirmationRef.current);
        console.log("🔍 Alternatives:", alternatives);
        
        setIsListening(false);
        setTimeout(() => {
          processVoiceInput(text, alternatives, waitingForConfirmationRef.current);
        }, 200);
      };

      recognitionRef.current.onend = () => {
        console.log("🎤 Recognition ended");
        setIsListening(false);
        
        if (modalOpenRef.current && !speakingRef.current) {
          setTimeout(() => {
            if (modalOpenRef.current && !speakingRef.current && !isListening) {
              console.log("🔄 Auto-restarting recognition...");
              startListening();
            }
          }, 2000);
        }
      };

      recognitionRef.current.onerror = (error) => {
        console.log("❌ Recognition error:", error.error);
        setIsListening(false);
        
        if (modalOpenRef.current && !speakingRef.current) {
          setTimeout(() => {
            if (modalOpenRef.current && !speakingRef.current) {
              startListening();
            }
          }, 1500);
        }
      };

      recognitionRef.current.onstart = () => {
        console.log("✅ Recognition started successfully");
      };

      console.log("✅ VoiceModal speech setup complete");
    }
  }, []);

  const resetState = () => {
    setSearchResults([]);
    setCurrentRecipeIndex(0);
    setWaitingForConfirmation(false);
    waitingForConfirmationRef.current = false;
    currentRecipeRef.current = null;
    searchResultsRef.current = [];
    currentIndexRef.current = 0;
    setTranscript("");
    setMessage("");
    setIsSpeaking(false);
    speakingRef.current = false;
  };

  const cleanup = () => {
    console.log("🧹 VoiceModal cleanup");
    modalOpenRef.current = false;
    setIsListening(false);
    setIsSpeaking(false);
    speakingRef.current = false;
    speechSynthesis.cancel();
    
    if (recognitionRef.current && isListening) {
      try { 
        recognitionRef.current.stop(); 
      } catch(e) {}
    }
  };

  // Fuzzy matching for voice commands
  const isYesCommand = (text, alternatives = []) => {
    const yesWords = ['yes', 'yeah', 'yep', 'ok', 'okay', 'sure', 'yah', 'ya', 'yas', 'yess', 'yees'];
    const allTexts = [text, ...alternatives];
    
    for (const t of allTexts) {
      for (const yesWord of yesWords) {
        if (t.includes(yesWord) || yesWord.includes(t.replace(/[^a-z]/g, ''))) {
          console.log("✅ YES detected in:", t, "matching:", yesWord);
          return true;
        }
      }
    }
    return false;
  };

  const isNoCommand = (text, alternatives = []) => {
    const noWords = ['no', 'nope', 'nah', 'next', 'skip'];
    const allTexts = [text, ...alternatives];
    
    for (const t of allTexts) {
      for (const noWord of noWords) {
        if (t.includes(noWord) || noWord.includes(t.replace(/[^a-z]/g, ''))) {
          console.log("❌ NO/NEXT detected in:", t, "matching:", noWord);
          return true;
        }
      }
    }
    return false;
  };

  const speak = (text, autoListen = true) => {
    return new Promise((resolve) => {
      console.log("🔊 VoiceModal speaking:", text.substring(0, 50) + "...");
      setIsSpeaking(true);
      speakingRef.current = true;
      setMessage(text);
      
      speechSynthesis.cancel();
      
      setTimeout(() => {
        if (!modalOpenRef.current) {
          resolve();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.volume = 1;
        
        const voices = speechSynthesis.getVoices();
        const googleVoice = voices.find(v => 
          v.name.includes('Google') && v.name.includes('Female')
        );
        
        if (googleVoice) {
          utterance.voice = googleVoice;
        }
        
        utterance.onstart = () => {
          console.log("✅ VoiceModal TTS started");
        };
        
        utterance.onend = () => {
          console.log("✅ VoiceModal TTS ended");
          setIsSpeaking(false);
          speakingRef.current = false;
          
          if (autoListen && modalOpenRef.current) {
            console.log("🎤 Starting listening after TTS");
            setTimeout(() => {
              if (modalOpenRef.current && !speakingRef.current) {
                startListening();
              }
            }, 1000);
          }
          
          resolve();
        };
        
        utterance.onerror = (error) => {
          console.log("❌ VoiceModal TTS error:", error.error);
          setIsSpeaking(false);
          speakingRef.current = false;
          resolve();
        };
        
        try {
          speechSynthesis.speak(utterance);
        } catch (error) {
          console.log("❌ VoiceModal speak failed:", error);
          setIsSpeaking(false);
          speakingRef.current = false;
          resolve();
        }
      }, 300);
    });
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening && modalOpenRef.current && !speakingRef.current) {
      console.log("🎤 Starting to listen...");
      setIsListening(true);
      setTranscript("");
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.log("❌ Start listening failed:", error);
        setIsListening(false);
      }
    }
  };

  const searchRecipes = async (query) => {
    try {
      console.log("🔍 Searching recipes for:", query);
      const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
      const results = await response.json();
      console.log("✅ Found", results.length, "recipes");
      return results;
    } catch (error) {
      console.log("❌ Search error:", error);
      return [];
    }
  };

  const processVoiceInput = async (text, alternatives = [], isConfirmationMode) => {
    console.log("🔄 Processing:", text, "| Alternatives:", alternatives, "| Confirmation mode:", isConfirmationMode);
    
    if (isConfirmationMode) {
      console.log("📋 CONFIRMATION MODE ACTIVE");
      
      if (isYesCommand(text, alternatives)) {
        console.log("✅ YES detected - Going to recipe");
        
        const recipe = currentRecipeRef.current;
        console.log("🔍 Current recipe from ref:", recipe?.title, "| ID:", recipe?.id);
        
        if (recipe && recipe.id) {
          console.log("🚀 Recipe confirmed, navigating to ID:", recipe.id);
          
          await speak("Perfect! Opening your recipe with automatic voice cooking guide. Get ready to cook!", false);
          
          setTimeout(() => {
            console.log("🚀 NAVIGATING NOW to recipe:", recipe.id);
            cleanup();
            onClose();
            navigate(`/recipe/${recipe.id}?voice=true`);
          }, 1500);
          
          return;
          
        } else {
          console.log("❌ Recipe data missing from ref");
          await speak("Sorry, recipe information is missing. Let's search again.");
        }
        
      } else if (isNoCommand(text, alternatives)) {
        console.log("❌ NO/NEXT detected - Showing next recipe");
        await showNextRecipe();
        
      } else {
        console.log("🔄 Treating as new search:", text);
        await searchAndShow(text);
      }
      
    } else {
      console.log("📋 SEARCH MODE ACTIVE");
      await searchAndShow(text);
    }
  };

  const searchAndShow = async (query) => {
    console.log("🔍 Searching and showing for:", query);
    
    const results = await searchRecipes(query);
    
    if (results.length > 0) {
      console.log("📊 Setting results:", results.length, "recipes found");
      
      setSearchResults(results);
      setCurrentRecipeIndex(0);
      setWaitingForConfirmation(true);
      waitingForConfirmationRef.current = true;
      
      const recipe = results[0];
      currentRecipeRef.current = recipe;
      searchResultsRef.current = results;
      currentIndexRef.current = 0;
      
      console.log("✅ Showing recipe 1 of", results.length, ":", recipe.title, "| ID:", recipe.id);
      
      const message = `Found ${recipe.title}. This recipe takes ${recipe.cookTime} and serves ${recipe.servings} people. Say YES to see this recipe in detail, or say NO or NEXT for other options.`;
      
      await speak(message);
      
    } else {
      console.log("❌ No recipes found for:", query);
      setWaitingForConfirmation(false);
      waitingForConfirmationRef.current = false;
      await speak("Sorry, no recipes found. Try saying soup, pasta, pizza, or another dish name.");
    }
  };

  const showNextRecipe = async () => {
    const nextIndex = currentIndexRef.current + 1;
    const totalResults = searchResultsRef.current.length;
    
    console.log("➡️ Next recipe requested - Current:", currentIndexRef.current, "| Next:", nextIndex, "| Total:", totalResults);
    
    if (nextIndex < totalResults) {
      setCurrentRecipeIndex(nextIndex);
      currentIndexRef.current = nextIndex;
      
      const recipe = searchResultsRef.current[nextIndex];
      currentRecipeRef.current = recipe;
      
      console.log("✅ Showing recipe", nextIndex + 1, "of", totalResults, ":", recipe.title, "| ID:", recipe.id);
      
      const message = `Here's option ${nextIndex + 1}: ${recipe.title}. This takes ${recipe.cookTime} and serves ${recipe.servings} people. Say YES to see this recipe, or NO or NEXT for more options.`;
      
      await speak(message);
      
    } else {
      console.log("🔄 No more recipes available, back to search mode");
      setWaitingForConfirmation(false);
      waitingForConfirmationRef.current = false;
      setSearchResults([]);
      searchResultsRef.current = [];
      currentRecipeRef.current = null;
      await speak("No more recipe options available. Say a different dish name like chicken, pasta, or pizza.");
    }
  };

  const startInitialFlow = async () => {
    await speak("Hi! Say a recipe name like chicken, pasta, or pizza to get started.");
  };

  const handleManualYes = () => {
    console.log("🖱️ Manual YES clicked");
    processVoiceInput("yes", [], waitingForConfirmationRef.current);
  };

  if (!isOpen) return null;

  const currentRecipe = waitingForConfirmation && searchResults.length > 0 ? searchResults[currentRecipeIndex] : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
        >
          ×
        </button>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">🎤 Voice Recipe Search</h2>

          {/* Status Circle */}
          <div className="mb-6">
            <div className={`w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center transition-all duration-500 ${
              isSpeaking ? 'bg-blue-500 animate-pulse shadow-2xl scale-110' :
              isListening ? 'bg-red-500 animate-pulse shadow-2xl scale-110' : 
              waitingForConfirmation ? 'bg-yellow-500 shadow-xl scale-105' :
              'bg-gray-300 shadow-lg'
            }`}>
              <span className="text-white text-5xl">
                {isSpeaking ? '🔊' : isListening ? '🎤' : waitingForConfirmation ? '❓' : '⚪'}
              </span>
            </div>
            
            <p className="text-xl font-bold text-gray-700 mb-2">
              {isSpeaking ? "🔊 AI Speaking..." :
               isListening && !waitingForConfirmation ? "🎧 Say recipe name..." :
               isListening && waitingForConfirmation ? "🎧 Say YES, NO or NEXT..." :
               waitingForConfirmation ? "🎯 Say YES, NO or NEXT" :
               "🎯 Say recipe name"}
            </p>
          </div>

          {/* Message Display */}
          <div className="mb-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-200 min-h-[120px] flex items-center justify-center">
            <p className="text-blue-800 font-medium text-lg text-center">
              {message || "Getting ready to listen..."}
            </p>
          </div>

          {/* User Input Display */}
          {transcript && (
            <div className="mb-4 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
              <p className="text-sm text-green-600">You said:</p>
              <p className="text-green-800 font-bold text-lg">"{transcript}"</p>
            </div>
          )}

          {/* Recipe Card */}
          {currentRecipe && (
            <div className="mb-6 p-5 bg-yellow-50 rounded-xl border-2 border-yellow-300 shadow-lg">
              <p className="text-sm text-yellow-600 font-medium mb-2">
                🍽️ Recipe Option {currentRecipeIndex + 1} of {searchResults.length}:
              </p>
              <p className="text-yellow-800 font-bold text-xl mb-2">{currentRecipe.title}</p>
              <p className="text-yellow-600 text-sm mb-3">ID: {currentRecipe.id}</p>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center p-2 bg-yellow-100 rounded">
                  <div className="text-lg">⏰</div>
                  <div className="text-sm font-medium">{currentRecipe.cookTime}</div>
                </div>
                <div className="text-center p-2 bg-yellow-100 rounded">
                  <div className="text-lg">👥</div>
                  <div className="text-sm font-medium">{currentRecipe.servings}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                <div className="p-2 bg-green-100 rounded text-green-800 font-bold">
                  🗣️ "YES" "YEP" "SURE"
                </div>
                <div className="p-2 bg-red-100 rounded text-red-800 font-bold">
                  🗣️ "NO" "NOPE"
                </div>
                <div className="p-2 bg-blue-100 rounded text-blue-800 font-bold">
                  🗣️ "NEXT" "SKIP"
                </div>
              </div>
              
              {/* Manual YES button for testing */}
              <button
                onClick={handleManualYes}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-bold text-sm"
              >
                🖱️ Manual YES (Working!)
              </button>
            </div>
          )}

          {/* Manual Controls */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={startListening}
              disabled={isListening || isSpeaking}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-bold text-sm"
            >
              🎤 Start Listening
            </button>
            
            {waitingForConfirmation && (
              <button
                onClick={() => showNextRecipe()}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-bold text-sm"
              >
                ➡️ Next Recipe
              </button>
            )}
          </div>

          {/* Voice Recognition Tips */}
          <div className="text-xs text-blue-600 bg-blue-50 p-3 rounded-lg mb-4">
            <p><strong>💡 Voice Tips:</strong></p>
            <p>• Speak clearly and loudly</p>
            <p>• Try: "YES", "YEP", "SURE" for confirmation</p>
            <p>• Try: "NO", "NEXT", "SKIP" for other options</p>
            <p>• Manual buttons work perfectly!</p>
          </div>

          {/* Debug Status */}
          <div className="text-xs text-gray-500 bg-gray-100 p-3 rounded-lg">
            <p><strong>Status:</strong> {isSpeaking ? 'Speaking' : isListening ? 'Listening' : 'Ready'}</p>
            <p><strong>Mode:</strong> {waitingForConfirmation ? '🔴 Confirmation' : '🔵 Search'}</p>
            <p><strong>Results:</strong> {searchResults.length} recipes</p>
            <p><strong>Current:</strong> {currentRecipeRef.current ? `${currentIndexRef.current + 1}. ${currentRecipeRef.current.title} (ID: ${currentRecipeRef.current.id})` : 'None'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
