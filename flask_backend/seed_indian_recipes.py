import os
import json
import time
from app import app, db
from models import Recipe
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

# Setup Gemini AI
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-flash-latest')

# States jinki recipes chahiye
STATES = ["Maharashtra", "Punjab", "Uttar Pradesh", "Bihar", "Tamil Nadu", "Rajasthan", "Gujarat"]

def fetch_recipes_for_state(state, count):
    print(f"\n🔄 Fetching {count} authentic recipes for {state} using Gemini AI...")
    
    prompt = f"""
    You are an expert Indian Chef. Provide exactly {count} authentic and popular recipes from the Indian state of {state}.
    Return ONLY a valid JSON array of objects. Do not include any markdown tags like ```json.
    Each object must have exactly these keys:
    - title (string, name of the dish)
    - description (string, 1-2 lines about the dish)
    - image_url (string, create a dummy placeholder URL like this: "[https://via.placeholder.com/400x300?text=Dish+Name](https://via.placeholder.com/400x300?text=Dish+Name)")
    - ready_in_minutes (integer, cooking time)
    - servings (integer)
    - difficulty (string, "Easy", "Medium", or "Hard")
    - ingredients (array of strings)
    - steps (array of strings)
    """
    
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Markdown backticks hatao
        if text.startswith('```json'):
            text = text[7:]
        if text.startswith('```'):
            text = text[3:]
        if text.endswith('```'):
            text = text[:-3]
            
        recipes_data = json.loads(text.strip())
        return recipes_data
    except Exception as e:
        print(f"❌ Error fetching {state} recipes: {e}")
        return []

def seed_database():
    with app.app_context():
        total_saved = 0
        for state in STATES:
            
            # 🔥 SMART LOGIC: Maharashtra ke liye 5, baaki sabke liye 3
            recipe_count = 5 if state == "Maharashtra" else 3
            
            recipes = fetch_recipes_for_state(state, recipe_count)
            
            if recipes:
                for r in recipes:
                    # Check if recipe already exists
                    existing = Recipe.query.filter_by(title=r.get('title')).first()
                    if not existing:
                        new_recipe = Recipe(
                            title=r.get('title'),
                            description=r.get('description'),
                            image_url=r.get('image_url', '').replace(" ", "+"),
                            ready_in_minutes=int(r.get('ready_in_minutes', 30)),
                            servings=int(r.get('servings', 2)),
                            difficulty=r.get('difficulty', 'Medium'),
                            ingredients=r.get('ingredients', []),
                            steps=r.get('steps', []),
                            country="India",
                            state=state,
                            status="approved" # 🔥 ADMIN FEATURE
                        )
                        db.session.add(new_recipe)
                        total_saved += 1
                
                db.session.commit()
                print(f"✅ Saved recipes for {state}")
            else:
                print(f"⚠️ Skipped {state} due to error.")

            # 🔥 API Rate limit se bachne ke liye 6 seconds ka aaram
            print(f"⏳ Waiting 6 seconds before fetching next state...")
            time.sleep(6)
            
        print(f"\n🎉 Success! Total {total_saved} new Indian recipes added to database!")

if __name__ == "__main__":
    seed_database()