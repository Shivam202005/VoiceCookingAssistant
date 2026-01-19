import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";

const API_BASE_URL = "/api";

export default function RecipeDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams(); // URL parameters padhne ke liye
  
  // 🔥 IMPORTANT: Check karo ki user Voice Search se aaya hai ya nahi
  const isAutoVoiceMode = searchParams.get('voice') === 'true';

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Voice states
  const [isReading, setIsReading] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [currentStepIndex, setCurrentStepIndex] = useState(0); // UI highlight ke liye
  
  // Refs (Loop control aur Memory ke liye)
  const isReadingRef = useRef(false);  // Loop ko rokne/chalane ke liye
  const stepIndexRef = useRef(0);      // Current Step yaad rakhne ke liye

  // Fetch Recipe
  useEffect(() => {
    async function fetchRecipe() {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/recipe/${id}`);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();
        setRecipe(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchRecipe();
  }, [id]);

  // 🔥 CONDITIONAL AUTO-START Logic
  // Sirf tab start hoga jab 'recipe' load ho AND 'isAutoVoiceMode' true ho
  useEffect(() => {
    if (recipe && isAutoVoiceMode && !isReadingRef.current) {
        // Thoda wait karke start karte hain
        setTimeout(() => {
            startVoiceReading(0); // 0 se start karo
        }, 1000);
    }
  }, [recipe, isAutoVoiceMode]);

  // TTS Helper (Bolne wala function)
  const speak = (text) => {
    return new Promise((resolve) => {
      speechSynthesis.cancel(); // Purana kuch bhi bol raha ho to chup karao
      setCurrentText(text);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      
      const voices = speechSynthesis.getVoices();
      // Female Google voice prefer karenge
      const googleVoice = voices.find(v => v.name.includes('Google') && v.name.includes('Female')) || voices[0];
      if (googleVoice) utterance.voice = googleVoice;

      utterance.onend = () => {
        resolve();
      };
      
      speechSynthesis.speak(utterance);
    });
  };

  // 🔥 SMART READING LOOP (Resume capability ke saath)
  const startVoiceReading = async (startIndex = 0) => {
    if (isReadingRef.current) return; // Already chal raha hai to ignore karo
    
    setIsReading(true);
    isReadingRef.current = true;
    
    try {
        // Intro message based on start index
        if(startIndex === 0) {
            await speak(`Starting ${recipe.title}. Let's cook!`);
        } else {
            await speak(`Resuming from step ${startIndex + 1}.`);
        }

        // Loop Steps
        for (let i = startIndex; i < recipe.steps.length; i++) {
            // Agar beech me rok diya (Ask AI ke liye), to loop break karo
            if(!isReadingRef.current) break; 

            stepIndexRef.current = i; // Ref update karo (Resume karne ke liye yaad rakho)
            setCurrentStepIndex(i);   // UI update karo taaki step highlight ho
            
            // Step bolo
            await speak(`Step ${i+1}. ${recipe.steps[i]}`);
            
            // Thoda pause har step ke baad
            await new Promise(r => setTimeout(r, 1500));
        }

        // Agar pura loop khatam ho gaya (bina roke)
        if(isReadingRef.current) {
             await speak("Recipe complete! Enjoy your meal.");
             setIsReading(false);
             isReadingRef.current = false;
             stepIndexRef.current = 0; // Reset kar do
        }

    } catch(e) { console.log(e); }
  };

  const stopReading = () => {
    setIsReading(false);
    isReadingRef.current = false;
    speechSynthesis.cancel();
    setCurrentText("");
  };

  // 🔥 ASK AI & AUTO-RESUME
  const handleAskAI = () => {
    // 1. Current Reading Roko
    stopReading(); 
    
    const recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.start();

    setCurrentText("🎧 Listening... Ask me anything!");

    recognition.onresult = async (event) => {
        const question = event.results[0][0].transcript;
        console.log("🗣️ User Asked:", question);
        setCurrentText(`Thinking: "${question}"...`);
        setAiThinking(true);

        try {
            // 2. AI se pucho
            const res = await fetch(`${API_BASE_URL}/ask-ai`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: question,
                    context: recipe
                })
            });

            const data = await res.json();
            setAiThinking(false);
            
            // 3. AI ka jawab bolo
            await speak(data.answer);

            // 4. 🔥 AUTO RESUME (Jadu Yahan Hai)
            // AI ke chup hote hi wapas wahin se shuru jahan chhoda tha
            setTimeout(() => {
                startVoiceReading(stepIndexRef.current);
            }, 500);

        } catch (err) {
            setAiThinking(false);
            speak("Sorry, connection error.");
        }
    };

    recognition.onerror = () => {
        setAiThinking(false);
        setCurrentText("❌ Didn't catch that. Try again.");
    };
  };

  if (loading) return <div className="p-10 text-center text-xl">Loading your delicious recipe...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;
  if (!recipe) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link to="/" className="text-green-600 font-bold mb-4 inline-block hover:underline">← Back to Recipes</Link>

        {/* 🧠 AI CONTROL CENTER */}
        <div className={`p-6 rounded-2xl shadow-xl border-2 mb-8 text-center relative overflow-hidden transition-all duration-300 ${aiThinking ? 'bg-orange-50 border-orange-400' : 'bg-white border-blue-100'}`}>
            
            <h2 className="text-2xl font-bold mb-2 text-gray-800">
                {aiThinking ? '🤖 Chef AI is Thinking...' : '🤖 AI Kitchen Assistant'}
            </h2>
            
            <p className="text-gray-600 mb-6 min-h-[3rem] font-medium text-lg flex items-center justify-center">
                {currentText || (isReading ? `Reading Step ${currentStepIndex + 1}...` : "I am ready! Click 'Read Recipe' or 'Ask AI'.")}
            </p>

            <div className="flex justify-center gap-4">
                {/* 🎤 ASK AI BUTTON */}
                <button 
                    onClick={handleAskAI}
                    disabled={aiThinking}
                    className="px-8 py-4 rounded-full font-bold text-lg shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:scale-105 transition-transform flex items-center gap-2"
                >
                    {aiThinking ? '⏳ Processing...' : '🎤 Ask AI Help (Pauses Recipe)'}
                </button>

                {/* MANUAL CONTROLS */}
                {!isReading ? (
                    <button 
                        onClick={() => startVoiceReading(stepIndexRef.current)} 
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-full font-bold shadow-lg"
                    >
                        {stepIndexRef.current === 0 ? '▶️ Read Recipe' : '▶️ Resume Recipe'}
                    </button>
                ) : (
                    <button onClick={stopReading} className="bg-red-500 hover:bg-red-600 text-white px-6 py-4 rounded-full font-bold shadow-lg">
                        ⏸️ Pause
                    </button>
                )}
            </div>
        </div>

        {/* Recipe Content */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <img src={recipe.img || recipe.image_url} alt={recipe.title} className="w-full h-72 object-cover"/>
            <div className="p-8">
                <h1 className="text-4xl font-extrabold mb-6 text-gray-800">{recipe.title}</h1>
                
                {/* Ingredients Grid */}
                <div className="mb-8 p-6 bg-yellow-50 rounded-xl border border-yellow-100">
                    <h3 className="text-2xl font-bold mb-4 text-yellow-800">🥕 Ingredients</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {recipe.ingredients.map((ing, i) => (
                            <div key={i} className="flex items-center gap-2 text-gray-700">
                                <span className="text-orange-500">•</span> {ing}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Steps List (Active Step Highlighting) */}
                <div>
                    <h3 className="text-2xl font-bold mb-6 text-gray-800">👨‍🍳 Instructions</h3>
                    <div className="space-y-6">
                        {recipe.steps.map((step, i) => (
                            <div 
                                key={i} 
                                className={`p-6 rounded-xl border-l-4 transition-all duration-300 ${
                                    currentStepIndex === i 
                                    ? 'bg-blue-50 border-blue-500 shadow-md transform scale-[1.02]' 
                                    : 'bg-white border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                <h4 className={`font-bold text-lg mb-2 ${currentStepIndex === i ? 'text-blue-600' : 'text-gray-500'}`}>
                                    Step {i+1}
                                </h4>
                                <p className="text-gray-700 leading-relaxed text-lg">{step}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}