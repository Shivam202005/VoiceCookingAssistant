# app.py - Database integrated version
from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, Recipe
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///recipes.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Fallback data (your original recipes)
FALLBACK_DATA = {
    "free": [
        {
            "id": 1,
            "title": "Classic Butter Chicken",
            "desc": "Rich and creamy butter chicken with aromatic spices",
            "img": "/images/f1.jpeg",
            "tag": "FREE",
            "cookTime": "45 minutes",
            "servings": 4,
            "difficulty": "Medium",
            "ingredients": ["Chicken", "Butter", "Cream", "Spices", "Onions", "Tomatoes"],
            "steps": [
                "Cut chicken into bite-sized pieces and marinate with yogurt and spices for 30 minutes.",
                "Heat oil in a pan and cook marinated chicken until golden brown.",
                "In the same pan, add butter and sauté chopped onions until golden.",
                "Add tomato puree, cook for 5-7 minutes until oil separates.",
                "Add cream, garam masala, and cooked chicken pieces.",
                "Simmer for 10 minutes, garnish with cilantro and serve hot."
            ]
        },
        {
            "id": 2,
            "title": "Vegetable Fried Rice",
            "desc": "Quick and delicious fried rice with colorful vegetables",
            "img": "/images/f1.jpeg",
            "tag": "FREE",
            "cookTime": "20 minutes",
            "servings": 3,
            "difficulty": "Easy",
            "ingredients": ["Rice", "Mixed vegetables", "Eggs", "Soy sauce", "Garlic", "Ginger"],
            "steps": [
                "Cook rice and let it cool completely (day-old rice works best).",
                "Heat oil in a wok over high heat.",
                "Add garlic and ginger, stir-fry for 30 seconds.",
                "Add mixed vegetables and stir-fry for 2-3 minutes.",
                "Push vegetables aside, scramble eggs on the other side.",
                "Add rice and soy sauce, toss everything together for 3-4 minutes."
            ]
        }
    ],
    "premium": [
        {
            "id": 21,
            "title": "Truffle Pasta",
            "desc": "Luxurious pasta with truffle oil and parmesan",
            "img": "/images/f1.jpeg",
            "tag": "PREMIUM",
            "cookTime": "25 minutes",
            "servings": 2,
            "difficulty": "Medium",
            "ingredients": ["Pasta", "Truffle oil", "Parmesan cheese", "Garlic"],
            "steps": [
                "Cook pasta until al dente in salted water.",
                "Heat truffle oil in pan with garlic.",
                "Toss pasta with truffle oil and parmesan.",
                "Serve with fresh black pepper."
            ]
        }
    ]
}

@app.route("/recipes")
def get_recipes():
    """Load from database first, fallback to hardcoded data"""
    try:
        free_recipes = Recipe.query.filter_by(category='FREE').all()
        premium_recipes = Recipe.query.filter_by(category='PREMIUM').all()
        
        if free_recipes or premium_recipes:
            return jsonify({
                'free': [recipe.to_dict() for recipe in free_recipes],
                'premium': [recipe.to_dict() for recipe in premium_recipes]
            })
        else:
            print("📝 Database empty - using fallback data")
            return jsonify(FALLBACK_DATA)
            
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify(FALLBACK_DATA)

@app.route("/recipe/<int:recipe_id>")
def get_recipe(recipe_id):
    """Get single recipe"""
    try:
        recipe = Recipe.query.get(recipe_id)
        if recipe:
            return jsonify(recipe.to_dict())
    except Exception as e:
        print(f"Database error: {e}")
    
    # Fallback search
    all_fallback = FALLBACK_DATA["free"] + FALLBACK_DATA["premium"]
    recipe = next((r for r in all_fallback if r["id"] == recipe_id), None)
    return jsonify(recipe) if recipe else ({"error": "Recipe not found"}, 404)

@app.route('/search')
def search_recipes():
    """Search recipes"""
    query = request.args.get('q', '')
    try:
        recipes = Recipe.query.filter(
            Recipe.title.ilike(f'%{query}%') | 
            Recipe.description.ilike(f'%{query}%')
        ).limit(20).all()
        
        return jsonify([recipe.to_dict() for recipe in recipes])
    except Exception as e:
        all_fallback = FALLBACK_DATA["free"] + FALLBACK_DATA["premium"]
        filtered = [r for r in all_fallback if query.lower() in r['title'].lower()]
        return jsonify(filtered)

@app.route('/stats')
def get_stats():
    """Database statistics"""
    try:
        total = Recipe.query.count()
        return jsonify({
            'total_recipes': total,
            'status': 'database' if total > 0 else 'fallback',
            'message': f'Serving from {"database" if total > 0 else "fallback data"}'
        })
    except Exception as e:
        return jsonify({
            'total_recipes': len(FALLBACK_DATA["free"] + FALLBACK_DATA["premium"]),
            'status': 'fallback',
            'error': str(e)
        })

# Create database tables when app starts
with app.app_context():
    try:
        db.create_all()
        print("✅ Database tables created successfully")
    except Exception as e:
        print(f"❌ Database creation error: {e}")

if __name__ == '__main__':
    print("🚀 Starting Flask Recipe API Server...")
    print("📊 Will use database if populated, fallback to hardcoded data otherwise")
    app.run(debug=True, host='127.0.0.1', port=5000)
