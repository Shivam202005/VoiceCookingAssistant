import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";

// ⚠️ Asli Imports (Make sure these paths are correct for your project)
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const API_BASE_URL = "/api";

export default function RecipeDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth(); 
  const { language } = useLanguage(); 
  
  const isAutoVoiceMode = searchParams.get('voice') === 'true';

  const [originalRecipe, setOriginalRecipe] = useState(null); 
  const [recipe, setRecipe] = useState(null); 
  
  const [loading, setLoading] = useState(true);
  const [translating, setTranslating] = useState(false); 
  const [error, setError] = useState(null);
  
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  
  const [isReading, setIsReading] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  
  const fileInputRef = useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const isReadingRef = useRef(false);
  const stepIndexRef = useRef(0);

  // Jab page load ho, purani awaaz band kar do
  useEffect(() => {
    window.speechSynthesis.cancel();
  }, []);

  // Browser voices load karne ke liye
  useEffect(() => {
    window.speechSynthesis.getVoices();
  }, []);

  // 1. Fetch Original Recipe
  // 🔥 FIX: Added user?.id in dependencies to completely stop the infinite loop!
  useEffect(() => {
    let isMounted = true;
    async function fetchRecipe() {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/recipe/${id}`);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();
        
        if (isMounted) {
            setOriginalRecipe(data);
            setLikes(data.likes_count || 0);
            setComments(data.comments || []);
        }

        if (user && isMounted) {
            try {
                const likeRes = await fetch(`${API_BASE_URL}/recipe/${id}/is_liked`);
                if (likeRes.ok) {
                    const likeData = await likeRes.json();
                    if(isMounted) setIsLiked(likeData.is_liked);
                }
            } catch (err) {
                console.error("Like check error", err);
            }
        }
      } catch (error) {
        if(isMounted) setError(error.message);
      } finally {
        if(isMounted) setLoading(false);
      }
    }
    if (id) fetchRecipe();
    
    return () => { isMounted = false; };
  }, [id, user?.id]); // <-- Yahan 'user' ki jagah 'user?.id' kiya taaki infinite loop na bane

  // 2. Translation Logic
  useEffect(() => {
    if (!originalRecipe) return;
    
    let isMounted = true;
    
    async function doTranslate() {
        if (language === 'en') {
            if(isMounted) {
                setRecipe(originalRecipe);
                setTranslating(false);
            }
            return;
        }

        if(isMounted) setTranslating(true); 
        try {
            const res = await fetch(`${API_BASE_URL}/translate-recipe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipe: originalRecipe, lang: language })
            });
            
            if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
            
            const translatedData = await res.json();
            if(isMounted) setRecipe(translatedData); 
        } catch (e) {
            console.error("Translation failed", e);
            if(isMounted) setRecipe(originalRecipe); 
        } finally {
            if(isMounted) setTranslating(false); 
        }
    }
    doTranslate();
    
    return () => { isMounted = false; };
  }, [originalRecipe, language]);

  // 3. Auto Voice Trigger
  useEffect(() => {
    let timer;
    if (recipe && isAutoVoiceMode && !isReadingRef.current && !translating) {
        window.speechSynthesis.cancel();
        timer = setTimeout(() => startVoiceReading(0), 1500);
    }
    return () => {
        if (timer) clearTimeout(timer);
    };
  }, [recipe, isAutoVoiceMode, translating]);

  // 🔥 PREMIUM VOICE SELECTOR + TEXT CLEANER
  const speak = (text) => {
    return new Promise((resolve) => {
      speechSynthesis.cancel();
      setCurrentText(text); // UI pe original text dikhega

      // Punctuation saaf karein taaki robotic "dot dot" na bole
      let voiceText = typeof text === 'string' ? text.replace(/[*#_]/g, "") : text;
      if (typeof voiceText === 'string') {
          voiceText = voiceText.replace(/[.!?,;:\-।]/g, " ");
      }

      const utterance = new SpeechSynthesisUtterance(voiceText);
      utterance.rate = 0.85; // Thoda slow taaki clear sunai de
      
      const voices = window.speechSynthesis.getVoices();

      if (language === 'mr') {
          let mrVoice = voices.find(v => v.lang.includes('mr'));
          if (mrVoice) {
              utterance.voice = mrVoice;
          } else {
              let hiVoice = voices.find(v => v.lang.includes('hi') && v.name.includes('Google')) || voices.find(v => v.lang.includes('hi'));
              if (hiVoice) utterance.voice = hiVoice;
              else utterance.lang = 'hi-IN';
          }
      } else if (language === 'hi') {
          let hiVoice = voices.find(v => v.lang.includes('hi') && v.name.includes('Google')) || voices.find(v => v.lang.includes('hi'));
          if (hiVoice) utterance.voice = hiVoice;
          else utterance.lang = 'hi-IN';
      } else {
          // ENGLISH PREMIUM VOICE: Pehle Indian English (en-IN) khojenge, fir Google ki best voice
          let premiumEnVoice = 
              voices.find(v => v.lang === 'en-IN' && v.name.includes('Google')) || 
              voices.find(v => v.lang === 'en-IN') || 
              voices.find(v => v.lang.startsWith('en') && v.name.includes('Google') && v.name.includes('Female')) || 
              voices.find(v => v.lang.startsWith('en') && v.name.includes('Google'));
          
          if (premiumEnVoice) {
              utterance.voice = premiumEnVoice;
          } else {
              utterance.lang = 'en-IN'; // Force Indian Accent
          }
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve(); 
      
      try { speechSynthesis.speak(utterance); } catch (e) { resolve(); }
    });
  };

  const startVoiceReading = async (startIndex = 0) => {
    if (isReadingRef.current) return;
    setIsReading(true);
    isReadingRef.current = true;
    
    const strStart = language === 'hi' ? `शुरू करते हैं ${recipe.title}। पहले सामग्री देखते हैं।` : language === 'mr' ? `सुरू करूया ${recipe.title}. आधी साहित्य पाहूया.` : `Starting ${recipe.title}. First, let's check the ingredients.`;
    const strSteps = language === 'hi' ? "अब पकाना शुरू करते हैं। ये रहे निर्देश।" : language === 'mr' ? "आता बनवायला सुरुवात करूया. हे आहेत टप्पे." : "Now, let's start cooking. Here are the instructions.";
    const strEnd = language === 'hi' ? "रेसिपी पूरी हुई! मजे से खाइए।" : language === 'mr' ? "रेसिपी पूर्ण झाली! आनंद घ्या." : "Recipe complete! Enjoy your meal.";
    
    try {
        if(startIndex === 0) {
            await speak(strStart);
            for (let i = 0; i < recipe.ingredients.length; i++) {
                if(!isReadingRef.current) break; 
                const ingText = typeof recipe.ingredients[i] === 'object' ? (recipe.ingredients[i].original || recipe.ingredients[i].name) : recipe.ingredients[i];
                await speak(ingText);
                await new Promise(r => setTimeout(r, 600)); 
            }
            if(isReadingRef.current) await speak(strSteps);
        }

        for (let i = startIndex; i < recipe.steps.length; i++) {
            if(!isReadingRef.current) break; 
            stepIndexRef.current = i;
            setCurrentStepIndex(i);
            const stepText = typeof recipe.steps[i] === 'object' ? recipe.steps[i].step || "Follow instruction." : recipe.steps[i];
            
            const stepPrefix = language === 'hi' ? `कदम ${i+1}` : language === 'mr' ? `टप्पा ${i+1}` : `Step ${i+1}`;
            await speak(`${stepPrefix}. ${stepText}`);
            await new Promise(r => setTimeout(r, 1500));
        }

        if(isReadingRef.current) {
             setCurrentStepIndex(-1);
             await speak(strEnd);
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
    
    if (language === 'hi') recognition.lang = 'hi-IN';
    else if (language === 'mr') recognition.lang = 'mr-IN';
    else recognition.lang = 'en-US';

    try {
        recognition.start();
        setCurrentText(language === 'hi' ? "🎧 सुन रहा हूँ... कुछ भी पूछें!" : language === 'mr' ? "🎧 ऐकत आहे... काहीही विचारा!" : "🎧 Listening... Ask me anything!");
    } catch (e) {
        console.error("Mic error:", e);
    }

    recognition.onresult = async (event) => {
        const question = event.results[0][0].transcript;
        setCurrentText(`Thinking: "${question}"...`);
        setAiThinking(true);

        try {
            const res = await fetch(`${API_BASE_URL}/ask-ai`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: question, context: recipe, lang: language, mode: 'general' })
            });
            const data = await res.json();
            setAiThinking(false);
            await speak(data.answer);
        } catch (err) {
            setAiThinking(false);
            speak(language === 'hi' ? "माफ़ करें, नेटवर्क में दिक्कत है।" : language === 'mr' ? "क्षमस्व, नेटवर्क त्रुटी." : "Sorry, connection error.");
        }
    };
    recognition.onerror = () => {
        setAiThinking(false);
        setCurrentText("❌ Didn't catch that. Try again.");
    };
  };

  const handleLike = async () => {
    if (!user) return alert(language === 'hi' ? "लाइक करने के लिए लॉगिन करें!" : "Please login to like recipes!");
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
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert(language === 'hi' ? "कमेंट करने के लिए लॉगिन करें!" : "Please login to comment!");
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

  const handleImageUpdate = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setUploadingImage(true);

    try {
        const res = await fetch(`${API_BASE_URL}/admin/recipe/${id}/update-image`, {
            method: 'POST',
            body: formData
        });

        if (res.ok) {
            const data = await res.json();
            alert("Image updated successfully! 📸");
            setRecipe({ ...recipe, image_url: data.image_url }); 
        } else {
            alert("Failed to update image.");
        }
    } catch (err) {
        console.error(err);
        alert("Server error while uploading.");
    } finally {
        setUploadingImage(false);
    }
  };

  const tLabels = {
    en: { back: "← Back to Recipes", aiAsst: "🤖 AI Kitchen Assistant", thinking: "🤖 Chef AI is Thinking...", read: "▶️ Read Recipe", pause: "⏸️ Stop", ask: "🎤 Ask AI Help", ing: "🥕 Ingredients", steps: "👨‍🍳 Instructions", likes: "Likes", commentTitle: "💬 Comments", postBtn: "Post", loginReq: "🔒 Login to like and comment.", transStatus: "🌍 Translating Recipe...", readyStatus: "I am ready! Click 'Read Recipe'.", loadingMsg: "Fetching Recipe..." },
    hi: { back: "← रेसिपी पर वापस जाएं", aiAsst: "🤖 AI किचन असिस्टेंट", thinking: "🤖 शेफ AI सोच रहा है...", read: "▶️ रेसिपी पढ़ें", pause: "⏸️ रोकें", ask: "🎤 AI से पूछें", ing: "🥕 सामग्री", steps: "👨‍🍳 पकाने की विधि", likes: "पसंद", commentTitle: "💬 टिप्पणियाँ", postBtn: "पोस्ट करें", loginReq: "🔒 लाइक और कमेंट करने के लिए लॉगिन करें।", transStatus: "🌍 रेसिपी का अनुवाद हो रहा है, कृपया प्रतीक्षा करें...", readyStatus: "मैं तैयार हूँ! 'रेसिपी पढ़ें' पर क्लिक करें।", loadingMsg: "रेसिपी ढूंढी जा रही है..." },
    mr: { back: "← रेसिपीवर परत जा", aiAsst: "🤖 AI किचन असिस्टंट", thinking: "🤖 शेफ AI विचार करत आहे...", read: "▶️ रेसिपी वाचा", pause: "⏸️ थांबवा", ask: "🎤 AI ला विचारा", ing: "🥕 साहित्य", steps: "👨‍🍳 कृती", likes: "आवडले", commentTitle: "💬 प्रतिक्रिया", postBtn: "पोस्ट करा", loginReq: "🔒 लाईक आणि कमेंट करण्यासाठी लॉगिन करा.", transStatus: "🌍 रेसिपीचे भाषांतर करत आहे, कृपया प्रतीक्षा करा...", readyStatus: "मी तयार आहे! 'रेसिपी वाचा' वर क्लिक करा.", loadingMsg: "रेसिपी शोधत आहे..." }
  };
  const tL = tLabels[language] || tLabels.en;

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl font-bold text-gray-500 bg-gray-50">{tL.loadingMsg}</div>;
  
  if (translating) return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pt-20">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-orange-500 mb-6"></div>
          <div className="text-2xl font-bold text-orange-600 animate-pulse">{tL.transStatus}</div>
      </div>
  );

  if (error) return <div className="p-10 text-center text-red-500 font-bold">Error: {error}</div>;
  if (!recipe) return null;

  let displayImage = recipe.image_url || recipe.img || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=600";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link to="/" className="text-green-600 font-bold mb-4 inline-block hover:underline">{tL.back}</Link>

        {/* AI CONTROL CENTER */}
        <div className={`p-6 rounded-2xl shadow-xl border-2 mb-8 text-center relative overflow-hidden transition-all duration-300 ${aiThinking ? 'bg-orange-50 border-orange-400' : 'bg-white border-blue-100'}`}>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">
                {aiThinking ? tL.thinking : tL.aiAsst}
            </h2>
            <p className="text-gray-600 mb-6 min-h-[3rem] font-medium text-lg flex items-center justify-center">
                {currentText || (isReading ? `Reading...` : tL.readyStatus)}
            </p>
            <div className="flex justify-center gap-4">
                <button onClick={handleAskAI} disabled={aiThinking || isReading} className="px-8 py-4 rounded-full font-bold text-lg shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed">
                    {aiThinking ? '⏳...' : tL.ask}
                </button>
                {!isReading ? (
                    <button onClick={() => startVoiceReading(stepIndexRef.current)} className="bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-full font-bold shadow-lg disabled:opacity-50">
                        {tL.read}
                    </button>
                ) : (
                    <button onClick={stopReading} className="bg-red-500 hover:bg-red-600 text-white px-6 py-4 rounded-full font-bold shadow-lg">
                        {tL.pause}
                    </button>
                )}
            </div>
        </div>

        {/* RECIPE DETAILS */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="relative w-full h-80 bg-black group">
                <img src={displayImage} alt={recipe.title} className="w-full h-full object-cover opacity-90 transition-opacity group-hover:opacity-100"/>
                {user?.role === 'admin' && (
                    <div className="absolute top-4 right-4 z-10">
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpdate} className="hidden" />
                        <button 
                            onClick={() => fileInputRef.current.click()}
                            disabled={uploadingImage}
                            className="bg-black/60 hover:bg-orange-500 text-white px-4 py-2 rounded-full font-bold shadow-xl backdrop-blur-md border border-white/20 transition-all"
                        >
                            {uploadingImage ? '⏳...' : '✏️ Change Image'}
                        </button>
                    </div>
                )}
            </div>

            <div className="p-8">
                <div className="flex justify-between items-start">
                    <h1 className="text-4xl font-extrabold mb-6 text-gray-800 flex-1">{recipe.title}</h1>
                    <div className="flex flex-col items-center bg-red-50 p-2 rounded-lg border border-red-100">
                        <span className="text-2xl font-bold text-red-500">❤️ {likes}</span>
                    </div>
                </div>
                
                {recipe.description && (
                    <p className="text-xl text-gray-600 mb-8 italic border-l-4 border-gray-300 pl-4">{recipe.description}</p>
                )}
                
                <div className="mb-8 p-6 bg-yellow-50 rounded-xl border border-yellow-100">
                    <h3 className="text-2xl font-bold mb-4 text-yellow-800">{tL.ing}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {recipe.ingredients.map((ing, i) => (
                            <div key={i} className="flex items-center gap-2 text-gray-700">
                                <span className="text-orange-500">•</span> 
                                {typeof ing === 'object' ? (ing.original || ing.name) : ing}
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-2xl font-bold mb-6 text-gray-800">{tL.steps}</h3>
                    <div className="space-y-6">
                        {recipe.steps.map((step, i) => (
                            <div key={i} className={`p-6 rounded-xl border-l-4 transition-all duration-300 ${currentStepIndex === i ? 'bg-blue-50 border-blue-500 shadow-md transform scale-[1.02]' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                <h4 className={`font-bold text-lg mb-2 ${currentStepIndex === i ? 'text-blue-600' : 'text-gray-500'}`}>
                                    {language === 'hi' ? `कदम ${i+1}` : language === 'mr' ? `टप्पा ${i+1}` : `Step ${i+1}`}
                                </h4>
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
                        isLiked ? 'bg-red-500 text-white shadow-red-200 transform scale-105' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    {isLiked ? '❤️ Liked' : '🤍 Like'} 
                </button>
            </div>

            <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                {tL.commentTitle} <span className="text-gray-400 text-lg font-normal">({comments.length})</span>
            </h3>
            
            <div className="space-y-4 mb-8 max-h-96 overflow-y-auto pr-2">
                {comments.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-400 italic">No comments yet.</p>
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
                        {tL.postBtn}
                    </button>
                </form>
            ) : (
                <div className="text-center p-4 bg-yellow-50 rounded-xl text-yellow-800 border border-yellow-200">
                    <span className="font-bold">{tL.loginReq}</span>
                </div>
            )}
        </div>

      </div>
    </div>
  );
}