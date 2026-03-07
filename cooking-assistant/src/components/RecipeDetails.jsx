import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "/api";

export default function RecipeDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const isAutoVoiceMode = searchParams.get('voice') === 'true';

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Like & Comment States
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  
  // Voice states
  const [isReading, setIsReading] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  const isReadingRef = useRef(false);
  const stepIndexRef = useRef(0);

  useEffect(() => {
    async function fetchRecipe() {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/recipe/${id}`);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();
        
        setRecipe(data);
        setLikes(data.likes_count || 0);
        setComments(data.comments || []);

        if (user) {
            try {
                const likeRes = await fetch(`${API_BASE_URL}/recipe/${id}/is_liked`);
                if (likeRes.ok) {
                    const likeData = await likeRes.json();
                    setIsLiked(likeData.is_liked);
                }
            } catch (err) {
                console.error("Error checking like status:", err);
            }
        }

      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchRecipe();
  }, [id, user]);

  useEffect(() => {
    if (recipe && isAutoVoiceMode && !isReadingRef.current) {
        setTimeout(() => {
            startVoiceReading(0);
        }, 1000);
    }
  }, [recipe, isAutoVoiceMode]);

  const speak = (text) => {
    return new Promise((resolve) => {
      speechSynthesis.cancel();
      setCurrentText(text);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      
      const voices = speechSynthesis.getVoices();
      const googleVoice = voices.find(v => v.name.includes('Google') && v.name.includes('Female')) || voices[0];
      if (googleVoice) utterance.voice = googleVoice;

      utterance.onend = () => {
        resolve();
      };
      
      speechSynthesis.speak(utterance);
    });
  };

  const startVoiceReading = async (startIndex = 0) => {
    if (isReadingRef.current) return;
    
    setIsReading(true);
    isReadingRef.current = true;
    
    try {
        if(startIndex === 0) {
            await speak(`Starting ${recipe.title}. First, let's check the ingredients.`);
            for (let i = 0; i < recipe.ingredients.length; i++) {
                if(!isReadingRef.current) break; 
                const ing = recipe.ingredients[i];
                const ingText = typeof ing === 'object' ? (ing.original || ing.name) : ing;
                await speak(ingText);
                await new Promise(r => setTimeout(r, 600)); 
            }
            if(isReadingRef.current) {
                await speak("Now, let's start cooking. Here are the instructions.");
            }
        } else {
            await speak(`Resuming from step ${startIndex + 1}.`);
        }

        for (let i = startIndex; i < recipe.steps.length; i++) {
            if(!isReadingRef.current) break; 
            stepIndexRef.current = i;
            setCurrentStepIndex(i);
            const stepText = typeof recipe.steps[i] === 'object' ? recipe.steps[i].step || "Follow instruction." : recipe.steps[i];
            await speak(`Step ${i+1}. ${stepText}`);
            await new Promise(r => setTimeout(r, 1500));
        }

        if(isReadingRef.current) {
             await speak("Recipe complete! Enjoy your meal.");
             setIsReading(false);
             isReadingRef.current = false;
             stepIndexRef.current = 0;
        }

    } catch(e) { console.log(e); }
  };

  const stopReading = () => {
    setIsReading(false);
    isReadingRef.current = false;
    speechSynthesis.cancel();
    setCurrentText("");
  };

  const handleAskAI = () => {
    stopReading(); 
    const recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.start();

    setCurrentText("🎧 Listening... Ask me anything!");

    recognition.onresult = async (event) => {
        const question = event.results[0][0].transcript;
        setCurrentText(`Thinking: "${question}"...`);
        setAiThinking(true);

        try {
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
            await speak(data.answer);
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

  const handleLike = async () => {
    if (!user) return alert("Please login to like recipes!");
    
    const originalLikes = likes;
    const originalIsLiked = isLiked;
    
    setLikes(isLiked ? likes - 1 : likes + 1);
    setIsLiked(!isLiked);

    try {
        const res = await fetch(`${API_BASE_URL}/recipe/${recipe.id}/like`, { method: 'POST' });
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setLikes(data.likes_count); 
    } catch (error) {
        setLikes(originalLikes);
        setIsLiked(originalIsLiked);
        console.error(error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please login to comment!");
    if (!newComment.trim()) return;

    try {
        const res = await fetch(`${API_BASE_URL}/recipe/${recipe.id}/comment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: newComment })
        });
        if (res.ok) {
            const data = await res.json();
            setComments([...comments, data.comment]);
            setNewComment("");
        }
    } catch (error) {
        console.error(error);
    }
  };

  if (loading) return <div className="p-10 text-center text-xl">Loading your delicious recipe...</div>;
  if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;
  if (!recipe) return null;

  // 🔥 THE SMART IMAGE FIX FOR RECIPE DETAILS PAGE
  const indianImages = [
    "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1589302168068-964664d93cb0?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop"
  ];
  const foreignImages = [
    "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop"
  ];

  let displayImage = recipe.image_url || recipe.img || "";
  if (!displayImage || !displayImage.startsWith("http") || displayImage.includes("placeholder") || displayImage.includes("f1.jpeg") || displayImage === "undefined") {
    if (recipe.country === "Foreign") {
      displayImage = foreignImages[(recipe.id || 0) % foreignImages.length];
    } else {
      displayImage = indianImages[(recipe.id || 0) % indianImages.length];
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link to="/" className="text-green-600 font-bold mb-4 inline-block hover:underline">← Back to Recipes</Link>

        {/* AI CONTROL CENTER */}
        <div className={`p-6 rounded-2xl shadow-xl border-2 mb-8 text-center relative overflow-hidden transition-all duration-300 ${aiThinking ? 'bg-orange-50 border-orange-400' : 'bg-white border-blue-100'}`}>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">
                {aiThinking ? '🤖 Chef AI is Thinking...' : '🤖 AI Kitchen Assistant'}
            </h2>
            <p className="text-gray-600 mb-6 min-h-[3rem] font-medium text-lg flex items-center justify-center">
                {currentText || (isReading ? `Reading...` : "I am ready! Click 'Read Recipe' or 'Ask AI'.")}
            </p>
            <div className="flex justify-center gap-4">
                <button onClick={handleAskAI} disabled={aiThinking} className="px-8 py-4 rounded-full font-bold text-lg shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:scale-105 transition-transform flex items-center gap-2">
                    {aiThinking ? '⏳ Processing...' : '🎤 Ask AI Help'}
                </button>
                {!isReading ? (
                    <button onClick={() => startVoiceReading(stepIndexRef.current)} className="bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-full font-bold shadow-lg">
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
            {/* 🔥 Yahan displayImage use kar rahe hain */}
            <img src={displayImage} alt={recipe.title} className="w-full h-72 object-cover"/>
            <div className="p-8">
                <div className="flex justify-between items-start">
                    <h1 className="text-4xl font-extrabold mb-6 text-gray-800 flex-1">{recipe.title}</h1>
                    <div className="flex flex-col items-center bg-red-50 p-2 rounded-lg border border-red-100">
                        <span className="text-2xl font-bold text-red-500">❤️ {likes}</span>
                        <span className="text-xs text-red-400 font-medium">Likes</span>
                    </div>
                </div>
                
                {/* Ingredients Grid */}
                <div className="mb-8 p-6 bg-yellow-50 rounded-xl border border-yellow-100">
                    <h3 className="text-2xl font-bold mb-4 text-yellow-800">🥕 Ingredients</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {recipe.ingredients.map((ing, i) => (
                            <div key={i} className="flex items-center gap-2 text-gray-700">
                                <span className="text-orange-500">•</span> 
                                {typeof ing === 'object' ? (ing.original || ing.name) : ing}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Steps List */}
                <div>
                    <h3 className="text-2xl font-bold mb-6 text-gray-800">👨‍🍳 Instructions</h3>
                    <div className="space-y-6">
                        {recipe.steps.map((step, i) => (
                            <div key={i} className={`p-6 rounded-xl border-l-4 transition-all duration-300 ${currentStepIndex === i ? 'bg-blue-50 border-blue-500 shadow-md transform scale-[1.02]' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                <h4 className={`font-bold text-lg mb-2 ${currentStepIndex === i ? 'text-blue-600' : 'text-gray-500'}`}>Step {i+1}</h4>
                                <p className="text-gray-700 leading-relaxed text-lg">
                                    {typeof step === 'object' ? step.step || "Follow instruction." : step}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* LIKE & COMMENT SECTION */}
        <div className="bg-white rounded-2xl shadow-lg mt-8 p-8 border border-gray-100">
            <div className="flex items-center gap-4 mb-8 border-b pb-6">
                <button 
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold text-lg transition-all shadow-sm ${
                        isLiked 
                        ? 'bg-red-500 text-white shadow-red-200 transform scale-105' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    {isLiked ? '❤️ Liked' : '🤍 Like Recipe'} 
                </button>
                <span className="text-gray-500 text-sm">
                    {isLiked ? 'You loved this!' : 'Did you like this recipe?'}
                </span>
            </div>

            <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                💬 Comments <span className="text-gray-400 text-lg font-normal">({comments.length})</span>
            </h3>
            
            <div className="space-y-4 mb-8 max-h-96 overflow-y-auto pr-2">
                {comments.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-400 italic">No comments yet. Be the first to share your thoughts!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center text-orange-700 font-bold text-xs">
                                        {comment.user ? comment.user.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <span className="font-bold text-gray-800">{comment.user}</span>
                                </div>
                                <span className="text-xs text-gray-400">{comment.date}</span>
                            </div>
                            <p className="text-gray-700 ml-10">{comment.text}</p>
                        </div>
                    ))
                )}
            </div>

            {user ? (
                <form onSubmit={handleCommentSubmit} className="flex gap-3">
                    <input 
                        type="text" 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..." 
                        className="flex-1 p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300 bg-gray-50 focus:bg-white transition-all"
                    />
                    <button type="submit" className="bg-orange-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-orange-600 shadow-md transition-transform hover:scale-105">
                        Post
                    </button>
                </form>
            ) : (
                <div className="text-center p-4 bg-yellow-50 rounded-xl text-yellow-800 border border-yellow-200">
                    <span className="font-bold">🔒 Login</span> to like and comment on this recipe.
                </div>
            )}
        </div>

      </div>
    </div>
  );
}