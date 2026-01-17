import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";

// Proxy use kar rahe hain, isliye direct /api
const API_BASE_URL = "/api";

export default function RecipeDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Voice states
  const [isReading, setIsReading] = useState(false);
  const [aiThinking, setAiThinking] = useState(false); // ✅ NEW: AI loading state
  const [currentSection, setCurrentSection] = useState("");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [voiceReady, setVoiceReady] = useState(false);

  const isReadingRef = useRef(false);
  const isVoiceMode = searchParams.get('voice') === 'true';

  // Voice setup (Same as before)
  useEffect(() => {
    const checkVoices = () => {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        setVoiceReady(true);
      }
    };
    checkVoices();
    speechSynthesis.onvoiceschanged = checkVoices;
  }, []);

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

  // TTS Function
  const speak = (text) => {
    return new Promise((resolve) => {
      // Agar AI bol raha hai to purana reading rok do
      speechSynthesis.cancel();
      setCurrentText(text);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      
      const voices = speechSynthesis.getVoices();
      const googleVoice = voices.find(v => v.name.includes('Google') && v.name.includes('Female'));
      if (googleVoice) utterance.voice = googleVoice;

      utterance.onend = () => {
        setCurrentText("");
        resolve();
      };
      
      speechSynthesis.speak(utterance);
    });
  };

  // 🔥 NEW: AI Question Handler
  const handleAskAI = () => {
    // 1. Reading roko
    stopReading();
    
    // 2. Recognition start karo
    const recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
    recognition.lang = 'en-US'; // English me sunega
    recognition.start();

    setCurrentText("🎧 Listening... Ask about substitutes or steps!");

    recognition.onresult = async (event) => {
        const question = event.results[0][0].transcript;
        console.log("🗣️ User Asked:", question);
        setCurrentText(`Thinking about: "${question}"...`);
        setAiThinking(true);

        try {
            // 3. Backend se pucho
            const res = await fetch(`${API_BASE_URL}/ask-ai`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: question,
                    context: recipe // Puri recipe bhej rahe hain
                })
            });

            const data = await res.json();
            setAiThinking(false);
            
            // 4. Jawab bolo
            await speak(data.answer);

        } catch (err) {
            setAiThinking(false);
            speak("Sorry, I couldn't connect to my brain.");
        }
    };

    recognition.onerror = () => {
        setCurrentText("❌ Didn't catch that. Try again.");
    };
  };

  // ... (startVoiceReading aur stopReading same rahenge) ...
  const startVoiceReading = async () => {
    if (!recipe || isReadingRef.current) return;
    setIsReading(true);
    isReadingRef.current = true;
    
    try {
        await speak(`Starting ${recipe.title}.`);
        if(!isReadingRef.current) return;

        // Steps Loop
        for (let i = 0; i < recipe.steps.length; i++) {
            if(!isReadingRef.current) break;
            setCurrentStepIndex(i);
            setCurrentSection("steps");
            await speak(`Step ${i+1}. ${recipe.steps[i]}`);
            await new Promise(r => setTimeout(r, 1000));
        }
        if(isReadingRef.current) await speak("Recipe complete!");
    } catch(e) { console.log(e); }
    setIsReading(false);
    isReadingRef.current = false;
  };

  const stopReading = () => {
    setIsReading(false);
    isReadingRef.current = false;
    speechSynthesis.cancel();
    setCurrentText("");
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;
  if (!recipe) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link to="/" className="text-green-600 font-bold mb-4 inline-block">← Back</Link>

        {/* 🧠 AI CONTROL CENTER */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-orange-200 mb-8 text-center relative overflow-hidden">
            
            {/* Background Animation if AI is Thinking */}
            {aiThinking && <div className="absolute inset-0 bg-orange-100 animate-pulse opacity-50"></div>}

            <h2 className="text-2xl font-bold mb-4 relative z-10">🤖 AI Kitchen Assistant</h2>
            
            <p className="text-gray-600 mb-6 min-h-[3rem] relative z-10 font-medium text-lg">
                {currentText || "Click 'Ask AI' to ask about substitutes, repeat steps, or nutrition!"}
            </p>

            <div className="flex justify-center gap-4 relative z-10">
                {/* 🎤 ASK AI BUTTON */}
                <button 
                    onClick={handleAskAI}
                    disabled={aiThinking}
                    className={`px-8 py-4 rounded-full font-bold text-lg shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 ${
                        aiThinking ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:shadow-purple-200'
                    }`}
                >
                    {aiThinking ? '🧠 Thinking...' : '🎤 Ask AI Help'}
                </button>

                {/* READ RECIPE BUTTON */}
                {!isReading ? (
                    <button onClick={startVoiceReading} className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg">
                        ▶️ Read Recipe
                    </button>
                ) : (
                    <button onClick={stopReading} className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg">
                        ⏹️ Stop Reading
                    </button>
                )}
            </div>
        </div>

        {/* Recipe Content (Same as before) */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <img src={recipe.img} alt={recipe.title} className="w-full h-64 object-cover"/>
            <div className="p-8">
                <h1 className="text-3xl font-bold mb-4">{recipe.title}</h1>
                
                {/* Ingredients */}
                <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4">Ingredients</h3>
                    <ul className="list-disc pl-5 space-y-2">
                        {recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                    </ul>
                </div>

                {/* Steps */}
                <div>
                    <h3 className="text-xl font-bold mb-4">Instructions</h3>
                    <div className="space-y-4">
                        {recipe.steps.map((step, i) => (
                            <div key={i} className={`p-4 rounded-lg border ${currentStepIndex === i && isReading ? 'bg-green-100 border-green-500' : 'bg-gray-50'}`}>
                                <span className="font-bold text-orange-600 mr-2">Step {i+1}:</span>
                                {step}
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