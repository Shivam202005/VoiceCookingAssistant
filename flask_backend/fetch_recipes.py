import requests
import time
import re
from app import app, db
from models import Recipe
import os
from dotenv import load_dotenv

load_dotenv()

SPOONACULAR_API_KEY = os.getenv('SPOONACULAR_API_KEY')

def fetch_recipes():
    print("🔄 Fetching recipes from Spoonacular...")
    recipes_data = []
    search_terms = ['chicken', 'pasta', 'rice', 'soup', 'salad']
    request_count = 0

    for term in search_terms:
        if request_count >= 10: break
        try:
            response = requests.get(
                "https://api.spoonacular.com/recipes/complexSearch",
                params={
                    'apiKey': SPOONACULAR_API_KEY,
                    'query': term,
                    'number': 8,
                    'addRecipeInformation': True,
                    'fillIngredients': True,
                    'addRecipeInstructions': True
                }
            )
            request_count += 1
            if response.status_code == 200:
                data = response.json()
                for recipe in data.get('results', []):
                    processed = process_recipe(recipe)
                    if processed: recipes_data.append(processed)
                print(f"✅ Got {len(data.get('results', []))} {term} recipes")
            time.sleep(1)
        except Exception as e:
            print(f"❌ Error with {term}: {e}")

    if recipes_data: save_to_database(recipes_data)

def process_recipe(recipe):
    try:
        ingredients = [ing.get('original', '') for ing in recipe.get('extendedIngredients', [])]
        steps = [step.get('step', '') for group in recipe.get('analyzedInstructions', []) for step in group.get('steps', [])]
        if not steps: steps = ["Cook until done."]
        desc = recipe.get('summary', '')
        if desc: desc = re.sub(r'<[^>]+>', '', desc)[:250]

        return {
            'spoonacular_id': recipe.get('id'),
            'title': recipe.get('title', 'Untitled'),
            'description': desc,
            'image_url': recipe.get('image', ''),
            'ready_in_minutes': recipe.get('readyInMinutes', 30),
            'servings': recipe.get('servings', 4),
            'difficulty': 'Easy' if recipe.get('readyInMinutes', 30) <= 30 else 'Medium',
            'ingredients': ingredients,
            'steps': steps,
            'country': 'Foreign',
            'state': 'All',
            'status': 'approved' # 🔥 Admin Feature: Auto-approve API recipes
        }
    except Exception as e: 
        return None

def save_to_database(recipes_data):
    with app.app_context():
        saved = 0
        for data in recipes_data:
            if not Recipe.query.filter_by(spoonacular_id=data['spoonacular_id']).first():
                recipe = Recipe(**data)
                db.session.add(recipe)
                saved += 1
        db.session.commit()
        print(f"✅ Successfully saved {saved} Foreign recipes!")

if __name__ == '__main__':
    fetch_recipes()