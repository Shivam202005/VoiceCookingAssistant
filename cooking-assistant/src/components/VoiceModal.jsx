import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const API_BASE_URL = "/api";

export default function VoiceModal({ isOpen, onClose }) {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentRecipeIndex, setCurrentRecipeIndex] = useState(0);
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
  const [message, setMessage] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  const recognitionRef = useRef(null);
  const speakingRef = useRef(false);
  const modalOpenRef = useRef(false);
  const waitingForConfirmationRef = useRef(false);
  const currentRecipeRef = useRef(null);
  const searchResultsRef = useRef([]);
  const currentIndexRef = useRef(0);
  const isThinkingRef = useRef(false);

  const tL = {
    en: { title: "Voice Recipe Search", gettingReady: "Getting ready to listen...", youSaid: "You said:", option: "Recipe Option", startListen: "Start Listening", nextRecipe: "Next Recipe", manualYes: "Manual YES", statusSpk: "Speaking...", statusLsnWait: "Say YES, NO or NEXT...", statusLsnNew: "Say recipe name...", statusWait: "Say YES, NO or NEXT", statusNew: "Say recipe name", statusThink: "Translating & Searching...", tipsTitle: "Voice Tips:", tip1: "Speak clearly", tip2: "Try: 'YES', 'YEP'", tip3: "Try: 'NO', 'NEXT'" },
    hi: { title: "वॉइस रेसिपी खोज", gettingReady: "सुनने की तैयारी कर रहा हूँ...", youSaid: "आपने कहा:", option: "रेसिपी विकल्प", startListen: "सुनना शुरू करें", nextRecipe: "अगली रेसिपी", manualYes: "मैन्युअल YES", statusSpk: "बोल रहा हूँ...", statusLsnWait: "YES, NO या NEXT बोलें...", statusLsnNew: "रेसिपी का नाम बोलें...", statusWait: "YES, NO या NEXT बोलें", statusNew: "रेसिपी का नाम बोलें", statusThink: "खोज रहा हूँ...", tipsTitle: "वॉइस टिप्स:", tip1: "साफ बोलें", tip2: "'हाँ' या 'YES' बोलें", tip3: "'नहीं' या 'NEXT' बोलें" },
    mr: { title: "व्हॉइस रेसिपी शोध", gettingReady: "ऐकण्याची तयारी करत आहे...", youSaid: "तुम्ही म्हणालात:", option: "रेसिपी पर्याय", startListen: "ऐकणे सुरू करा", nextRecipe: "पुढची रेसिपी", manualYes: "मॅन्युअल YES", statusSpk: "बोलत आहे...", statusLsnWait: "YES, NO किंवा NEXT म्हणा...", statusLsnNew: "रेसिपीचे नाव सांगा...", statusWait: "YES, NO किंवा NEXT म्हणा", statusNew: "रेसिपीचे नाव सांगा", statusThink: "शोधत आहे...", tipsTitle: "व्हॉइस टिप्स:", tip1: "स्पष्ट बोला", tip2: "'हो' किंवा 'YES' म्हणा", tip3: "'नाही' किंवा 'NEXT' म्हणा" }
  }[language] || tLabels.en;

  const setThinkingState = (val) => {
    setIsThinking(val);
    isThinkingRef.current = val;
  };

  // Ensure voices are loaded so our Premium Voice Selector works
  useEffect(() => {
    window.speechSynthesis.getVoices();
  }, []);

  useEffect(() => {
    modalOpenRef.current = isOpen;
    if (isOpen) {
      resetState();
      setTimeout(() => { startInitialFlow(); }, 1000);
    } else {
      cleanup();
    }
  }, [isOpen]);

  useEffect(() => {
    waitingForConfirmationRef.current = waitingForConfirmation;
  }, [waitingForConfirmation]);

  useEffect(() => {
    searchResultsRef.current = searchResults;
    currentIndexRef.current = currentRecipeIndex;
    if (searchResults.length > 0 && currentRecipeIndex < searchResults.length) {
      currentRecipeRef.current = searchResults[currentRecipeIndex];
    }
  }, [searchResults, currentRecipeIndex]);

  useEffect(() => {
    if (!recognitionRef.current && typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 5;

      recognitionRef.current.onresult = (event) => {
        const results = event.results[0];
        const text = results[0].transcript.toLowerCase().trim();
        const alternatives = [];
        for (let i = 0; i < results.length; i++) {
          alternatives.push(results[i].transcript.toLowerCase().trim());
        }
        setTranscript(text);
        setIsListening(false);
        setThinkingState(true); 

        setTimeout(() => {
          processVoiceInput(text, alternatives, waitingForConfirmationRef.current);
        }, 200);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (modalOpenRef.current && !speakingRef.current && !isThinkingRef.current) {
          setTimeout(() => {
            if (modalOpenRef.current && !speakingRef.current && !isListening && !isThinkingRef.current) {
              startListening();
            }
          }, 1000); // Wait bit longer before restarting mic if nothing was said
        }
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        if (modalOpenRef.current && !speakingRef.current && !isThinkingRef.current) {
          setTimeout(() => {
            if (modalOpenRef.current && !speakingRef.current && !isThinkingRef.current) {
              startListening();
            }
          }, 1000);
        }
      };
    }
  }, [language]);

  useEffect(() => {
      if (recognitionRef.current) {
          if (language === 'hi') recognitionRef.current.lang = 'hi-IN';
          else if (language === 'mr') recognitionRef.current.lang = 'mr-IN';
          else recognitionRef.current.lang = 'en-US';
      }
  }, [language]);

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
    setThinkingState(false);
  };

  const cleanup = () => {
    modalOpenRef.current = false;
    setIsListening(false);
    setIsSpeaking(false);
    speakingRef.current = false;
    setThinkingState(false);
    speechSynthesis.cancel();
    if (recognitionRef.current && isListening) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }
  };

  // 🔥 YES COMMAND: Super Forgiving
  const isYesCommand = (text, alternatives = []) => {
    const yesWords = ['yes', 'yeah', 'yep', 'ok', 'okay', 'sure', 'haan', 'ha', 'han', 'ho', 'hoy', 'kholo', 'open', 'हाँ', 'हां', 'हा', 'होय', 'हो', 'ठीक', 'यस', 'ओके'];
    const allTexts = [text, ...alternatives].map(t => t.toLowerCase());
    
    for (const t of allTexts) {
      const cleanT = t.replace(/[.!?,;:\-।]/g, ' ').trim();
      const words = cleanT.split(/\s+/);
      if (words.some(w => yesWords.includes(w))) return true;
      if (yesWords.includes(cleanT)) return true;
    }
    return false;
  };

  const isNoCommand = (text, alternatives = []) => {
    const noWords = ['no', 'nope', 'nah', 'next', 'skip', 'nahi', 'nako', 'agla', 'pudhche', 'नहीं', 'नही', 'नको', 'पुढचे', 'अगला', 'नो', 'नेक्स्ट'];
    const allTexts = [text, ...alternatives].map(t => t.toLowerCase());
    
    for (const t of allTexts) {
      const cleanT = t.replace(/[.!?,;:\-।]/g, ' ').trim();
      const words = cleanT.split(/\s+/);
      if (words.some(w => noWords.includes(w))) return true;
      if (noWords.includes(cleanT)) return true;
    }
    return false;
  };

  // 🔥 PREMIUM VOICE SELECTOR + TEXT CLEANER
  const speak = (text, autoListen = true) => {
    return new Promise((resolve) => {
      setIsSpeaking(true);
      speakingRef.current = true;
      setMessage(text);
      speechSynthesis.cancel();
      
      setTimeout(() => {
        if (!modalOpenRef.current) return resolve();

        // Punctuation saaf karein taaki robotic "dot dot" na bole
        let voiceText = text.replace(/[*#_]/g, ""); 
        voiceText = voiceText.replace(/[.!?,;:\-।]/g, " ");

        const utterance = new SpeechSynthesisUtterance(voiceText);
        utterance.rate = 0.9;
        
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
            // 🔥 ENGLISH PREMIUM VOICE: Pehle Indian English (en-IN) khojenge, fir Google ki best voice
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

        utterance.onend = () => {
          setIsSpeaking(false);
          speakingRef.current = false;
          if (autoListen && modalOpenRef.current && !isThinkingRef.current) {
            setTimeout(() => {
              // Quick mic restart
              if (modalOpenRef.current && !speakingRef.current && !isThinkingRef.current) startListening();
            }, 200); 
          }
          resolve();
        };
        
        utterance.onerror = () => {
          setIsSpeaking(false);
          speakingRef.current = false;
          resolve();
        };
        
        try { speechSynthesis.speak(utterance); } catch (e) { resolve(); }
      }, 300);
    });
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening && modalOpenRef.current && !speakingRef.current && !isThinkingRef.current) {
      setIsListening(true);
      setTranscript("");
      try { recognitionRef.current.start(); } catch (e) { setIsListening(false); }
    }
  };

  const searchRecipes = async (query) => {
    try {
      const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
      return await response.json();
    } catch (error) {
      return [];
    }
  };

  const safeTranslateSearch = async (query) => {
    const isEnglishOnly = /^[a-zA-Z\s]+$/.test(query);
    if (isEnglishOnly) return query.trim();

    const dict = {
        "वडापाव": "vada pav", "वडा पाव": "vada pav", "चिकन": "chicken", 
        "पनीर": "paneer", "सूप": "soup", "डोसा": "dosa", "मसाला डोसा": "masala dosa",
        "पाव भाजी": "pav bhaji", "मिसळ": "misal", "मछली": "fish", "अंडा": "egg",
        "पोहा": "poha", "कांदा पोहा": "kanda poha", "पुरणपोळी": "puran poli"
    };
    
    for (const [hiWord, enWord] of Object.entries(dict)) {
        if (query.includes(hiWord)) return enWord;
    }

    // AI Timeout logic so it doesn't hang forever
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
        const res = await fetch(`${API_BASE_URL}/ask-ai`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                question: query, 
                lang: 'en',
                mode: 'search'
            }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        const data = await res.json();
        let aiAnswer = data.answer.toLowerCase();
        aiAnswer = aiAnswer.replace(/[^a-z ]/g, '').trim();

        if (!aiAnswer || aiAnswer.includes('error') || aiAnswer.length > 30) {
            return query; 
        }
        return aiAnswer;
    } catch (err) {
        clearTimeout(timeoutId);
        return query; 
    }
  };

  const processVoiceInput = async (text, alternatives = [], isConfirmationMode) => {
    if (isConfirmationMode) {
      if (isYesCommand(text, alternatives)) {
        setThinkingState(false);
        const recipe = currentRecipeRef.current;
        if (recipe && recipe.id) {
          const msg = language === 'hi' ? "ठीक है, आपकी रेसिपी खोल रहा हूँ।" : language === 'mr' ? "ठीक आहे, उघडत आहे." : "Perfect! Opening your recipe.";
          await speak(msg, false);
          setTimeout(() => {
            cleanup();
            onClose();
            navigate(`/recipe/${recipe.id}?voice=true`);
          }, 1500);
          return;
        }
      } else if (isNoCommand(text, alternatives)) {
        setThinkingState(false);
        await showNextRecipe();
      } else {
        await searchAndShow(text);
      }
    } else {
      if (isYesCommand(text, alternatives) || isNoCommand(text, alternatives)) {
          setThinkingState(false);
          const errorMsg = language === 'hi' 
            ? "कृपया किसी डिश का नाम बोलें।" 
            : language === 'mr' 
            ? "कृपया एखाद्या पदार्थाचे नाव सांगा." 
            : "Please say a dish name.";
          await speak(errorMsg, true);
          return;
      }
      await searchAndShow(text);
    }
  };

  const searchAndShow = async (query) => {
    setThinkingState(true); 
    let searchTerm = query.trim();
    
    if (language === 'hi' || language === 'mr') {
        searchTerm = await safeTranslateSearch(query);
    } else {
        searchTerm = query.toLowerCase().replace(/[^a-z ]/g, '').trim();
    }

    const results = await searchRecipes(searchTerm);
    setThinkingState(false); 
    
    if (results.length > 0) {
      setSearchResults(results);
      setCurrentRecipeIndex(0);
      setWaitingForConfirmation(true);
      waitingForConfirmationRef.current = true;
      
      const recipe = results[0];
      currentRecipeRef.current = recipe;
      searchResultsRef.current = results;
      currentIndexRef.current = 0;
      
      const msg = language === 'hi' 
        ? `मुझे ${recipe.title} मिला है। इसे खोलने के लिए YES या हाँ बोलें, या दूसरी डिश के लिए NEXT बोलें।`
        : language === 'mr'
        ? `मला ${recipe.title} सापडले आहे. पाहण्यासाठी YES किंवा होय म्हणा, किंवा दुसऱ्यासाठी NEXT म्हणा.`
        : `Found ${recipe.title}. Say YES to open it, or NEXT for other options.`;
      
      await speak(msg);
    } else {
      setWaitingForConfirmation(false);
      waitingForConfirmationRef.current = false;
      const noMsg = language === 'hi' ? "रेसिपी नहीं मिली। कोई और डिश का नाम बोलें।" : language === 'mr' ? "रेसिपी सापडली नाही. दुसरे नाव सांगा." : "Sorry, no recipes found. Try saying another dish name.";
      await speak(noMsg);
    }
  };

  const showNextRecipe = async () => {
    const nextIndex = currentIndexRef.current + 1;
    const totalResults = searchResultsRef.current.length;
    
    if (nextIndex < totalResults) {
      setCurrentRecipeIndex(nextIndex);
      currentIndexRef.current = nextIndex;
      const recipe = searchResultsRef.current[nextIndex];
      currentRecipeRef.current = recipe;
      
      const msg = language === 'hi' 
        ? `अगला विकल्प है ${recipe.title}। क्या इसे खोलूं? हाँ या NEXT बोलें।`
        : language === 'mr'
        ? `पुढचा पर्याय ${recipe.title} आहे. उघडू का? होय किंवा NEXT म्हणा.`
        : `Here's option ${nextIndex + 1}: ${recipe.title}. Say YES to open, or NEXT for more.`;
      
      await speak(msg);
    } else {
      setWaitingForConfirmation(false);
      waitingForConfirmationRef.current = false;
      setSearchResults([]);
      searchResultsRef.current = [];
      currentRecipeRef.current = null;
      
      const endMsg = language === 'hi' ? "और कोई विकल्प नहीं है। दूसरी डिश का नाम बोलें।" : language === 'mr' ? "आणखी पर्याय नाहीत. दुसरे नाव सांगा." : "No more options. Say a different dish name.";
      await speak(endMsg);
    }
  };

  const startInitialFlow = async () => {
    const startMsg = language === 'hi' ? "नमस्ते! किसी भी रेसिपी का नाम बोलें।" : language === 'mr' ? "नमस्कार! कोणत्याही रेसिपीचे नाव सांगा." : "Hi! Say a recipe name like chicken or pizza.";
    await speak(startMsg);
  };

  const handleManualYes = () => {
    setThinkingState(true);
    processVoiceInput("yes", [], waitingForConfirmationRef.current);
  };

  if (!isOpen) return null;

  const currentRecipe = waitingForConfirmation && searchResults.length > 0 ? searchResults[currentRecipeIndex] : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">🎤 {tL.title}</h2>

          <div className="mb-6">
            <div className={`w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center transition-all duration-500 ${
              isSpeaking ? 'bg-blue-500 animate-pulse shadow-2xl scale-110' :
              isThinking ? 'bg-orange-400 animate-bounce shadow-xl scale-105' : 
              isListening ? 'bg-red-500 animate-pulse shadow-2xl scale-110' : 
              waitingForConfirmation ? 'bg-yellow-500 shadow-xl scale-105' :
              'bg-gray-300 shadow-lg'
            }`}>
              <span className="text-white text-5xl">
                {isSpeaking ? '🔊' : isThinking ? '⏳' : isListening ? '🎤' : waitingForConfirmation ? '❓' : '⚪'}
              </span>
            </div>
            
            <p className="text-xl font-bold text-gray-700 mb-2">
              {isThinking ? tL.statusThink :
               isSpeaking ? tL.statusSpk :
               isListening && !waitingForConfirmation ? tL.statusLsnNew :
               isListening && waitingForConfirmation ? tL.statusLsnWait :
               waitingForConfirmation ? tL.statusWait :
               tL.statusNew}
            </p>
          </div>

          <div className="mb-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-200 min-h-[120px] flex items-center justify-center">
            <p className="text-blue-800 font-medium text-lg text-center">
              {isThinking ? tL.statusThink : message || tL.gettingReady}
            </p>
          </div>

          {transcript && (
            <div className="mb-4 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
              <p className="text-sm text-green-600">{tL.youSaid}</p>
              <p className="text-green-800 font-bold text-lg">"{transcript}"</p>
            </div>
          )}

          {currentRecipe && !isThinking && (
            <div className="mb-6 p-5 bg-yellow-50 rounded-xl border-2 border-yellow-300 shadow-lg">
              <p className="text-sm text-yellow-600 font-medium mb-2">
                🍽️ {tL.option} {currentRecipeIndex + 1} / {searchResults.length}:
              </p>
              <p className="text-yellow-800 font-bold text-xl mb-2">{currentRecipe.title}</p>
              
              <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                <div className="p-2 bg-green-100 rounded text-green-800 font-bold">🗣️ YES / HAAN</div>
                <div className="p-2 bg-red-100 rounded text-red-800 font-bold">🗣️ NO / NAHI</div>
                <div className="p-2 bg-blue-100 rounded text-blue-800 font-bold">🗣️ NEXT / AGLA</div>
              </div>
              
              <button
                onClick={handleManualYes}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-bold text-sm"
              >
                🖱️ {tL.manualYes}
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={startListening}
              disabled={isListening || isSpeaking || isThinking}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-bold text-sm"
            >
              🎤 {tL.startListen}
            </button>
            
            {waitingForConfirmation && !isThinking && (
              <button
                onClick={() => { setThinkingState(true); showNextRecipe(); }}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-bold text-sm"
              >
                ➡️ {tL.nextRecipe}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}