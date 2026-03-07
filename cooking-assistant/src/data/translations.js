const translations = {
  en: {
    // Navbar
    brandName: "CookBuddy",
    searchPlaceholder: "Search for recipes...",
    askAI: "Ask AI",
    upload: "Upload",
    signUp: "Sign Up",
    logout: "Logout",

    // Hero
    heroTitle: "Discover Global & Regional Flavors",
    heroSubtitle: "Authentic recipes from every corner of the world",

    // Filters
    filters: "Filters",
    country: "Country",
    state: "State",
    allMixed: "All (Mixed)",
    india: "India",
    foreign: "Foreign",
    // States
    stateAll: "All",
    stateMaharashtra: "Maharashtra",
    statePunjab: "Punjab",
    stateUP: "Uttar Pradesh",
    stateBihar: "Bihar",
    stateTamilNadu: "Tamil Nadu",
    stateRajasthan: "Rajasthan",
    stateGujarat: "Gujarat",

    // Recipe grid
    allRecipes: "All Recipes",
    recipes: "Recipes",
    specialities: "Specialities",
    noRecipesFound: "No recipes found. Try searching something else!",
    loading: "Loading Authentic Dishes...",

    // Veg badges
    veg: "🟢 Veg",
    nonVeg: "🔴 Non-Veg",

    // VoiceModal UI
    voiceModalTitle: "🎤 Voice Recipe Search",
    aiSpeaking: "🔊 AI Speaking...",
    sayRecipeName: "🎧 Say recipe name...",
    sayYesNoNext: "🎧 Say YES, NO or NEXT...",
    waitingYesNoNext: "🎯 Say YES, NO or NEXT",
    waitingRecipeName: "🎯 Say recipe name",
    gettingReady: "Getting ready to listen...",
    youSaid: "You said:",
    recipeOption: "🍽️ Recipe Option",
    of: "of",
    startListening: "🎤 Start Listening",
    nextRecipe: "➡️ Next Recipe",
    manualYes: "🖱️ Manual YES",
    voiceTips: "💡 Voice Tips:",
    voiceTip1: "Speak clearly and loudly",
    voiceTip2: 'Try: "YES", "YEP" for confirmation',
    voiceTip3: 'Try: "NO", "NEXT" for other options',

    // VoiceModal spoken prompts
    voiceGreeting: "Hi! Say a recipe name like chicken, pasta, or pizza to get started.",
    voiceFound: (title, cookTime, servings) =>
      `Found ${title}. This recipe takes ${cookTime} and serves ${servings} people. Say YES to see this recipe in detail, or say NO or NEXT for other options.`,
    voiceOption: (index, title, cookTime, servings) =>
      `Here's option ${index}: ${title}. This takes ${cookTime} and serves ${servings} people. Say YES to see this recipe, or NO or NEXT for more options.`,
    voiceConfirm: "Perfect! Opening your recipe with automatic voice cooking guide. Get ready to cook!",
    voiceNoRecipe: "Sorry, recipe information is missing. Let's search again.",
    voiceNotFound: "Sorry, no recipes found. Try saying soup, pasta, pizza, or another dish name.",
    voiceNoMore: "No more recipe options available. Say a different dish name like chicken, pasta, or pizza.",

    // RecipeDetails UI
    loadingRecipe: "Loading your delicious recipe...",
    backToRecipes: "← Back to Recipes",
    aiAssistant: "🤖 AI Kitchen Assistant",
    aiThinking: "🤖 Chef AI is Thinking...",
    askAIHelp: "🎤 Ask AI Help",
    processing: "⏳ Processing...",
    readRecipe: "▶️ Read Recipe",
    resumeRecipe: "▶️ Resume Recipe",
    pause: "⏸️ Pause",
    ingredients: "🥕 Ingredients",
    instructions: "👨‍🍳 Instructions",
    step: "Step",
    liked: "❤️ Liked",
    likeRecipe: "🤍 Like Recipe",
    youLovedThis: "You loved this!",
    didYouLike: "Did you like this recipe?",
    comments: "💬 Comments",
    writeComment: "Write a comment...",
    post: "Post",
    loginToLike: "🔒 Login to like and comment on this recipe.",
    noComments: "No comments yet. Be the first to share your thoughts!",
    aiReady: "I am ready! Click 'Read Recipe' or 'Ask AI'.",
    aiListening: "🎧 Listening... Ask me anything!",
    aiNoAnswer: "Sorry, connection error.",
    aiDidntCatch: "❌ Didn't catch that. Try again.",

    // RecipeDetails spoken prompts
    voiceStarting: (title) => `Starting ${title}. First, let's check the ingredients.`,
    voiceCookingNow: "Now, let's start cooking. Here are the instructions.",
    voiceResuming: (step) => `Resuming from step ${step}.`,
    voiceComplete: "Recipe complete! Enjoy your meal.",
    voiceStep: (num, text) => `Step ${num}. ${text}`,
  },

  hi: {
    // Navbar
    brandName: "CookBuddy",
    searchPlaceholder: "रेसिपी खोजें...",
    askAI: "AI से पूछें",
    upload: "अपलोड",
    signUp: "साइन अप",
    logout: "लॉगआउट",

    // Hero
    heroTitle: "वैश्विक और क्षेत्रीय स्वाद खोजें",
    heroSubtitle: "दुनिया के हर कोने से प्रामाणिक रेसिपी",

    // Filters
    filters: "फ़िल्टर",
    country: "देश",
    state: "राज्य",
    allMixed: "सभी (मिश्रित)",
    india: "भारत",
    foreign: "विदेशी",
    stateAll: "सभी",
    stateMaharashtra: "महाराष्ट्र",
    statePunjab: "पंजाब",
    stateUP: "उत्तर प्रदेश",
    stateBihar: "बिहार",
    stateTamilNadu: "तमिल नाडु",
    stateRajasthan: "राजस्थान",
    stateGujarat: "गुजरात",

    // Recipe grid
    allRecipes: "सभी रेसिपी",
    recipes: "रेसिपी",
    specialities: "विशेषताएँ",
    noRecipesFound: "कोई रेसिपी नहीं मिली। कुछ और खोजें!",
    loading: "स्वादिष्ट व्यंजन लोड हो रहे हैं...",

    // Veg badges
    veg: "🟢 शाकाहारी",
    nonVeg: "🔴 मांसाहारी",

    // VoiceModal UI
    voiceModalTitle: "🎤 वॉयस रेसिपी खोज",
    aiSpeaking: "🔊 AI बोल रहा है...",
    sayRecipeName: "🎧 रेसिपी का नाम बोलें...",
    sayYesNoNext: "🎧 हाँ, नहीं या अगला बोलें...",
    waitingYesNoNext: "🎯 हाँ, नहीं या अगला बोलें",
    waitingRecipeName: "🎯 रेसिपी का नाम बोलें",
    gettingReady: "सुनने के लिए तैयार हो रहे हैं...",
    youSaid: "आपने कहा:",
    recipeOption: "🍽️ रेसिपी विकल्प",
    of: "में से",
    startListening: "🎤 सुनना शुरू करें",
    nextRecipe: "➡️ अगली रेसिपी",
    manualYes: "🖱️ हाँ (मैन्युअल)",
    voiceTips: "💡 वॉयस टिप्स:",
    voiceTip1: "स्पष्ट और जोर से बोलें",
    voiceTip2: 'पुष्टि के लिए: "हाँ", "हां" बोलें',
    voiceTip3: 'अन्य विकल्पों के लिए: "नहीं", "अगला" बोलें',

    // VoiceModal spoken prompts
    voiceGreeting: "नमस्ते! चिकन, पास्ता या पिज्जा जैसा रेसिपी का नाम बोलें।",
    voiceFound: (title, cookTime, servings) =>
      `${title} मिली। इस रेसिपी में ${cookTime} लगता है और ${servings} लोगों के लिए है। विस्तार से देखने के लिए हाँ बोलें, या अन्य विकल्पों के लिए नहीं या अगला बोलें।`,
    voiceOption: (index, title, cookTime, servings) =>
      `विकल्प ${index}: ${title}। इसमें ${cookTime} लगता है और ${servings} लोगों के लिए है। इसे देखने के लिए हाँ बोलें, या अन्य के लिए नहीं या अगला।`,
    voiceConfirm: "बहुत बढ़िया! आपकी रेसिपी खुल रही है। खाना बनाने के लिए तैयार हो जाइए!",
    voiceNoRecipe: "माफ करें, रेसिपी की जानकारी नहीं मिली। फिर से खोजते हैं।",
    voiceNotFound: "माफ करें, कोई रेसिपी नहीं मिली। सूप, पास्ता, पिज्जा या कुछ और बोलें।",
    voiceNoMore: "और कोई रेसिपी नहीं बची। कोई अलग व्यंजन का नाम बोलें जैसे चिकन, पास्ता।",

    // RecipeDetails UI
    loadingRecipe: "आपकी स्वादिष्ट रेसिपी लोड हो रही है...",
    backToRecipes: "← रेसिपी पर वापस जाएं",
    aiAssistant: "🤖 AI रसोई सहायक",
    aiThinking: "🤖 Chef AI सोच रहा है...",
    askAIHelp: "🎤 AI से मदद मांगें",
    processing: "⏳ प्रोसेस हो रहा है...",
    readRecipe: "▶️ रेसिपी पढ़ें",
    resumeRecipe: "▶️ जारी रखें",
    pause: "⏸️ रोकें",
    ingredients: "🥕 सामग्री",
    instructions: "👨‍🍳 निर्देश",
    step: "चरण",
    liked: "❤️ पसंद किया",
    likeRecipe: "🤍 रेसिपी पसंद करें",
    youLovedThis: "आपको यह बहुत पसंद आई!",
    didYouLike: "क्या आपको यह रेसिपी पसंद आई?",
    comments: "💬 टिप्पणियाँ",
    writeComment: "टिप्पणी लिखें...",
    post: "पोस्ट",
    loginToLike: "🔒 लाइक और टिप्पणी के लिए लॉगिन करें।",
    noComments: "अभी तक कोई टिप्पणी नहीं। पहले अपने विचार साझा करें!",
    aiReady: "मैं तैयार हूँ! 'रेसिपी पढ़ें' या 'AI से पूछें' पर क्लिक करें।",
    aiListening: "🎧 सुन रहा हूँ... कुछ भी पूछें!",
    aiNoAnswer: "माफ करें, कनेक्शन में समस्या।",
    aiDidntCatch: "❌ समझ नहीं आया। फिर से कोशिश करें।",

    // RecipeDetails spoken prompts
    voiceStarting: (title) => `${title} शुरू करते हैं। पहले सामग्री देखते हैं।`,
    voiceCookingNow: "अब खाना बनाना शुरू करते हैं। ये रहे निर्देश।",
    voiceResuming: (step) => `चरण ${step} से जारी कर रहे हैं।`,
    voiceComplete: "रेसिपी पूरी हुई! खाने का आनंद लें।",
    voiceStep: (num, text) => `चरण ${num}। ${text}`,
  },

  mr: {
    // Navbar
    brandName: "CookBuddy",
    searchPlaceholder: "रेसिपी शोधा...",
    askAI: "AI ला विचारा",
    upload: "अपलोड",
    signUp: "साइन अप",
    logout: "लॉगआउट",

    // Hero
    heroTitle: "जागतिक आणि प्रादेशिक चव शोधा",
    heroSubtitle: "जगाच्या प्रत्येक कोपऱ्यातून अस्सल पाककृती",

    // Filters
    filters: "फिल्टर",
    country: "देश",
    state: "राज्य",
    allMixed: "सर्व (मिश्रित)",
    india: "भारत",
    foreign: "परदेशी",
    stateAll: "सर्व",
    stateMaharashtra: "महाराष्ट्र",
    statePunjab: "पंजाब",
    stateUP: "उत्तर प्रदेश",
    stateBihar: "बिहार",
    stateTamilNadu: "तामिळनाडू",
    stateRajasthan: "राजस्थान",
    stateGujarat: "गुजरात",

    // Recipe grid
    allRecipes: "सर्व पाककृती",
    recipes: "पाककृती",
    specialities: "विशेषता",
    noRecipesFound: "कोणतीही पाककृती सापडली नाही. दुसरे काहीतरी शोधा!",
    loading: "स्वादिष्ट पदार्थ लोड होत आहेत...",

    // Veg badges
    veg: "🟢 शाकाहारी",
    nonVeg: "🔴 मांसाहारी",

    // VoiceModal UI
    voiceModalTitle: "🎤 व्हॉइस पाककृती शोध",
    aiSpeaking: "🔊 AI बोलत आहे...",
    sayRecipeName: "🎧 पाककृतीचे नाव सांगा...",
    sayYesNoNext: "🎧 हो, नाही किंवा पुढे सांगा...",
    waitingYesNoNext: "🎯 हो, नाही किंवा पुढे सांगा",
    waitingRecipeName: "🎯 पाककृतीचे नाव सांगा",
    gettingReady: "ऐकण्यासाठी तयार होत आहे...",
    youSaid: "तुम्ही म्हणालात:",
    recipeOption: "🍽️ पाककृती पर्याय",
    of: "पैकी",
    startListening: "🎤 ऐकणे सुरू करा",
    nextRecipe: "➡️ पुढील पाककृती",
    manualYes: "🖱️ हो (मॅन्युअल)",
    voiceTips: "💡 व्हॉइस टिप्स:",
    voiceTip1: "स्पष्ट आणि मोठ्याने बोला",
    voiceTip2: 'पुष्टीसाठी: "हो", "होय" म्हणा',
    voiceTip3: 'इतर पर्यायांसाठी: "नाही", "पुढे" म्हणा',

    // VoiceModal spoken prompts
    voiceGreeting: "नमस्कार! चिकन, पास्ता किंवा पिझ्झा सारखे पाककृतीचे नाव सांगा.",
    voiceFound: (title, cookTime, servings) =>
      `${title} सापडली. या पाककृतीला ${cookTime} लागतो आणि ${servings} जणांसाठी आहे. तपशीलवार पाहण्यासाठी हो म्हणा, किंवा इतर पर्यायांसाठी नाही किंवा पुढे म्हणा.`,
    voiceOption: (index, title, cookTime, servings) =>
      `पर्याय ${index}: ${title}. याला ${cookTime} लागतो आणि ${servings} जणांसाठी आहे. हे पाहण्यासाठी हो म्हणा, किंवा इतरांसाठी नाही किंवा पुढे.`,
    voiceConfirm: "छान! तुमची पाककृती उघडत आहे. स्वयंपाकासाठी तयार व्हा!",
    voiceNoRecipe: "माफ करा, पाककृतीची माहिती सापडली नाही. पुन्हा शोधूया.",
    voiceNotFound: "माफ करा, कोणतीही पाककृती सापडली नाही. सूप, पास्ता, पिझ्झा किंवा इतर काही सांगा.",
    voiceNoMore: "आणखी पर्याय उपलब्ध नाहीत. चिकन, पास्ता सारखे वेगळे नाव सांगा.",

    // RecipeDetails UI
    loadingRecipe: "तुमची स्वादिष्ट पाककृती लोड होत आहे...",
    backToRecipes: "← पाककृतींवर परत जा",
    aiAssistant: "🤖 AI स्वयंपाकघर सहाय्यक",
    aiThinking: "🤖 Chef AI विचार करत आहे...",
    askAIHelp: "🎤 AI कडून मदत घ्या",
    processing: "⏳ प्रक्रिया होत आहे...",
    readRecipe: "▶️ पाककृती वाचा",
    resumeRecipe: "▶️ पुढे सुरू करा",
    pause: "⏸️ थांबवा",
    ingredients: "🥕 साहित्य",
    instructions: "👨‍🍳 सूचना",
    step: "पायरी",
    liked: "❤️ आवडले",
    likeRecipe: "🤍 पाककृती आवडली",
    youLovedThis: "तुम्हाला हे खूप आवडले!",
    didYouLike: "ही पाककृती आवडली का?",
    comments: "💬 टिप्पण्या",
    writeComment: "टिप्पणी लिहा...",
    post: "पोस्ट",
    loginToLike: "🔒 लाईक आणि टिप्पणीसाठी लॉगिन करा.",
    noComments: "अजून कोणतीही टिप्पणी नाही. पहिले तुमचे विचार शेअर करा!",
    aiReady: "मी तयार आहे! 'पाककृती वाचा' किंवा 'AI ला विचारा' वर क्लिक करा.",
    aiListening: "🎧 ऐकत आहे... काहीही विचारा!",
    aiNoAnswer: "माफ करा, कनेक्शन त्रुटी.",
    aiDidntCatch: "❌ समजले नाही. पुन्हा प्रयत्न करा.",

    // RecipeDetails spoken prompts
    voiceStarting: (title) => `${title} सुरू करूया. आधी साहित्य पाहूया.`,
    voiceCookingNow: "आता स्वयंपाक सुरू करूया. या आहेत सूचना.",
    voiceResuming: (step) => `पायरी ${step} पासून पुढे सुरू करत आहे.`,
    voiceComplete: "पाककृती पूर्ण! जेवणाचा आनंद घ्या.",
    voiceStep: (num, text) => `पायरी ${num}. ${text}`,
  },
};

export default translations;
