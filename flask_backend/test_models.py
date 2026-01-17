import google.generativeai as genai
import os
from dotenv import load_dotenv

# Environment variables load karo
load_dotenv()

# API Key Check
api_key = os.getenv('GEMINI_API_KEY')

if not api_key:
    print("❌ Error: API Key not found in .env file")
else:
    print(f"✅ API Key Found: {api_key[:10]}...")
    
    try:
        genai.configure(api_key=api_key)
        
        print("\n🔍 Listing Available Models for your Key...")
        print("-" * 40)
        
        # Google se pucho ki mere liye kaunse models available hain
        models = genai.list_models()
        found_any = False
        
        for m in models:
            # Hum sirf wo models dhund rahe hain jo 'generateContent' support karte hain (Chat wale)
            if 'generateContent' in m.supported_generation_methods:
                print(f"🌟 Available: {m.name}")
                found_any = True
        
        print("-" * 40)
        
        if not found_any:
            print("❌ No Chat models found! API Key might have restrictions.")
        else:
            print("✅ Copy one of the names above (e.g., 'models/gemini-1.5-flash') and use it in app.py")
            
    except Exception as e:
        print(f"\n❌ Connection Error: {e}")