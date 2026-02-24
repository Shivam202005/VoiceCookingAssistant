import os
import json
from app import app, db
from models import Recipe
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

# Setup Gemini AI
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-flash-latest')

# States jinki recipes chahiye (5 per state)
STATES = ["Maharashtra", "Punjab", "Uttar Pradesh", "Bihar", "Tamil Nadu", "Rajasthan", "Gujarat"]

def fetch_recipes_for_state(state):
    print(f"\n🔄 Fetching 5 authentic recipes for {state} using Gemini AI...")
    
    prompt = f"""
    You are an expert Indian Chef. Provide exactly 5 authentic and popular recipes from the Indian state of {state}.
    Return ONLY a valid JSON array of objects. Do not include any markdown tags like ```json.
    Each object must have exactly these keys:
    - title (string, name of the dish)
    - description (string, 1-2 lines about the dish)
    - image_url (string, create a dummy placeholder URL like this: "[https://via.placeholder.com/400x300?text=Dish+Name](https://via.placeholder.com/400x300?text=Dish+Name)")
    - ready_in_minutes (integer, cooking time)
    - servings (integer)
    - difficulty (string, "Easy", "Medium", or "Hard")
    - ingredients (array of strings, e.g. ["2 cups flour", "1 tsp salt"])
    - steps (array of strings, e.g. ["Mix ingredients.", "Cook for 10 mins."])
    """
    
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Markdown backticks hatao agar AI ne galti se bhej diye
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
            recipes = fetch_recipes_for_state(state)
            
            for r in recipes:
                # Check if recipe already exists to avoid duplicates
                existing = Recipe.query.filter_by(title=r.get('title')).first()
                if not existing:
                    new_recipe = Recipe(
                        title=r.get('title'),
                        description=r.get('description'),
                        image_url=r.get('image_url').replace(" ", "+"), # URL me spaces fix karne ke liye
                        ready_in_minutes=int(r.get('ready_in_minutes', 30)),
                        servings=int(r.get('servings', 2)),
                        difficulty=r.get('difficulty', 'Medium'),
                        ingredients=r.get('ingredients', []),
                        steps=r.get('steps', []),
                        country="India",
                        state=state
                    )
                    db.session.add(new_recipe)
                    total_saved += 1
            
            # Har state ke baad save kar lo
            db.session.commit()
            print(f"✅ Saved recipes for {state}")
            
        print(f"\n🎉 Success! Total {total_saved} new Indian recipes added to database!")

if __name__ == "__main__":
    seed_database()