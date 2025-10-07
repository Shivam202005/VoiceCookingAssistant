# flask_backend/fetch_recipes.py
import requests
import json
import time
import re
from app import app, db
from models import Recipe
import os
from dotenv import load_dotenv

load_dotenv()

SPOONACULAR_API_KEY = os.getenv('SPOONACULAR_API_KEY')

def test_setup():
    """Test if everything is set up correctly"""
    print("🔧 Testing setup...")
    
    if not SPOONACULAR_API_KEY or SPOONACULAR_API_KEY == 'your_actual_api_key_here':
        print("❌ ERROR: SPOONACULAR_API_KEY not set in .env file!")
        print("   Please edit .env file and add your real API key")
        return False
    
    print(f"✅ API Key found: {SPOONACULAR_API_KEY[:10]}...")
    
    # Test API connection
    try:
        response = requests.get(
            "https://api.spoonacular.com/recipes/complexSearch",
            params={'apiKey': SPOONACULAR_API_KEY, 'query': 'test', 'number': 1}
        )
        
        if response.status_code == 200:
            print("✅ API connection successful!")
            return True
        else:
            print(f"❌ API Error: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False

def fetch_recipes():
    """Fetch recipes from Spoonacular"""
    if not test_setup():
        return
    
    print("🔄 Fetching recipes from Spoonacular...")
    
    recipes_data = []
    request_count = 0
    max_requests = 10  # Conservative limit for testing
    
    # Different search terms
    search_terms = ['chicken', 'pasta', 'rice', 'soup', 'salad']
    
    for term in search_terms:
        if request_count >= max_requests:
            break
            
        try:
            response = requests.get(
                "https://api.spoonacular.com/recipes/complexSearch",
                params={
                    'apiKey': SPOONACULAR_API_KEY,
                    'query': term,
                    'number': 8,  # 8 recipes per search
                    'addRecipeInformation': True,
                    'fillIngredients': True,
                    'addRecipeInstructions': True
                }
            )
            
            request_count += 1
            print(f"📝 API Call #{request_count}: Fetching {term} recipes...")
            
            if response.status_code == 200:
                data = response.json()
                
                for recipe in data.get('results', []):
                    # Process recipe data
                    processed = process_recipe(recipe)
                    if processed:
                        recipes_data.append(processed)
                        
                print(f"✅ Got {len(data.get('results', []))} {term} recipes")
            else:
                print(f"❌ Error fetching {term}: {response.status_code}")
                
            time.sleep(1)  # Rate limiting
            
        except Exception as e:
            print(f"❌ Error with {term}: {e}")
    
    print(f"📦 Total recipes processed: {len(recipes_data)}")
    
    if recipes_data:
        save_to_database(recipes_data)
    else:
        print("❌ No recipes were fetched")

def process_recipe(recipe):
    """Process Spoonacular recipe data"""
    try:
        # Extract ingredients
        ingredients = []
        for ingredient in recipe.get('extendedIngredients', []):
            ingredients.append({
                'name': ingredient.get('name', ''),
                'original': ingredient.get('original', ''),
                'amount': ingredient.get('amount', 0),
                'unit': ingredient.get('unit', '')
            })
        
        # Extract steps
        steps = []
        for instruction_group in recipe.get('analyzedInstructions', []):
            for step in instruction_group.get('steps', []):
                steps.append(step.get('step', ''))
        
        # Fallback steps
        if not steps:
            steps = [
                "Prepare all ingredients as listed",
                "Follow standard cooking method for this dish",
                "Cook until done and season to taste",
                "Serve hot and enjoy!"
            ]
        
        # Clean description
        description = recipe.get('summary', '')
        if description:
            description = re.sub(r'<[^>]+>', '', description)[:250]
        
        return {
            'spoonacular_id': recipe.get('id'),
            'title': recipe.get('title', 'Untitled Recipe'),
            'description': description,
            'image_url': recipe.get('image', '') or '/images/f1.jpeg',
            
            'ready_in_minutes': recipe.get('readyInMinutes', 30),
            'servings': recipe.get('servings', 4),
            'difficulty': 'Easy' if recipe.get('readyInMinutes', 30) <= 30 else 'Medium',
            
            'ingredients': ingredients,
            'steps': steps,
            
            # Future data
            'cuisines': recipe.get('cuisines', []),
            'diets': recipe.get('diets', []),
            'nutrition': recipe.get('nutrition', {}),
            
            'category': 'FREE'
        }
        
    except Exception as e:
        print(f"❌ Error processing recipe: {e}")
        return None

def save_to_database(recipes_data):
    """Save recipes to database"""
    print(f"💾 Saving {len(recipes_data)} recipes to database...")
    
    with app.app_context():
        saved = 0
        
        for recipe_data in recipes_data:
            try:
                # Check if exists
                existing = Recipe.query.filter_by(
                    spoonacular_id=recipe_data['spoonacular_id']
                ).first()
                
                if existing:
                    continue
                
                recipe = Recipe(**recipe_data)
                db.session.add(recipe)
                saved += 1
                
            except Exception as e:
                print(f"❌ Error saving recipe: {e}")
        
        try:
            db.session.commit()
            print(f"✅ Successfully saved {saved} recipes!")
        except Exception as e:
            print(f"❌ Database error: {e}")
            db.session.rollback()

if __name__ == '__main__':
    print("🚀 Recipe Database Setup")
    print("=" * 40)
    fetch_recipes()
