# app.py - Fixed version for your existing setup
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Your existing recipe data (keep as-is for now)
RECIPE_DATA = {
    "free": [
        {
            "id": 1,
            "title": "Classic Butter Chicken",
            "desc": "Rich and creamy butter chicken with aromatic spices, perfect with rice or naan.",
            "img": "/images/f1.jpeg",
            "tag": "FREE",
            "cookTime": "45 minutes",
            "servings": 4,
            "difficulty": "Medium",
            "steps": [
                "Cut chicken into bite-sized pieces and marinate with yogurt, ginger-garlic paste, and spices for 30 minutes.",
                "Heat oil in a pan and cook marinated chicken until golden brown, then set aside.",
                "In the same pan, add butter and sauté chopped onions until golden.",
                "Add tomato puree, cook for 5-7 minutes until oil separates.",
                "Add cream, garam masala, and cooked chicken pieces.",
                "Simmer for 10 minutes, garnish with cilantro and serve hot with rice or naan."
            ]
        },
        {
            "id": 2,
            "title": "Vegetable Fried Rice",
            "desc": "Quick and delicious fried rice loaded with colorful vegetables and aromatic flavors.",
            "img": "/images/f1.jpeg",
            "tag": "FREE",
            "cookTime": "20 minutes",
            "servings": 3,
            "difficulty": "Easy",
            "steps": [
                "Cook rice and let it cool completely (preferably day-old rice works best).",
                "Heat oil in a wok or large pan over high heat.",
                "Add chopped garlic and ginger, stir-fry for 30 seconds until fragrant.",
                "Add mixed vegetables (carrots, peas, bell peppers) and stir-fry for 2-3 minutes.",
                "Push vegetables to one side, scramble beaten eggs on the other side.",
                "Add cooked rice, soy sauce, and salt. Toss everything together for 3-4 minutes.",
                "Garnish with chopped scallions and serve hot."
            ]
        }
        # Add more of your existing recipes here...
    ],
    "premium": [
        {
            "id": 21,
            "title": "Truffle Pasta",
            "desc": "Luxurious pasta with truffle oil and parmesan.",
            "img": "/images/f1.jpeg",
            "tag": "PREMIUM",
            "cookTime": "25 minutes",
            "servings": 2,
            "difficulty": "Medium",
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
    return jsonify(RECIPE_DATA)

@app.route("/recipe/<int:recipe_id>")
def get_recipe(recipe_id):
    all_recipes = RECIPE_DATA["free"] + RECIPE_DATA["premium"]
    recipe = next((r for r in all_recipes if r["id"] == recipe_id), None)
    return jsonify(recipe) if recipe else ({"error": "Recipe not found"}, 404)

@app.route('/search')
def search_recipes():
    query = request.args.get('q', '').lower()
    all_recipes = RECIPE_DATA["free"] + RECIPE_DATA["premium"]
    
    filtered = [
        recipe for recipe in all_recipes 
        if query in recipe['title'].lower() or query in recipe['desc'].lower()
    ]
    
    return jsonify(filtered)

@app.route('/stats')
def get_stats():
    total_free = len(RECIPE_DATA["free"])
    total_premium = len(RECIPE_DATA["premium"])
    
    return jsonify({
        'total_recipes': total_free + total_premium,
        'free_recipes': total_free,
        'premium_recipes': total_premium,
        'status': 'working'
    })

if __name__ == '__main__':
    print("🚀 Starting Flask Recipe API Server...")
    app.run(debug=True, host='127.0.0.1', port=5000)
