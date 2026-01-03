# app.py - COMPLETE FIXED VERSION WITH AUTH
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
from models import db, User, Recipe
import os
from dotenv import load_dotenv


# Load environment variables
load_dotenv()


# CREATE APP FIRST
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///recipes.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


# INITIALIZE EXTENSIONS
db.init_app(app)
migrate = Migrate(app, db)

# ✅ FIXED CORS CONFIGURATION
CORS(app, 
     resources={r"/*": {
         "origins": ["http://localhost:5173", "http://localhost:3000"],
         "allow_headers": ["Content-Type", "Authorization"],
         "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         "supports_credentials": True
     }})
     
bcrypt = Bcrypt(app)


# Flask-Login setup
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


# Fallback data
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


# ROUTES
@app.route("/recipes")
def get_recipes():
    """Load recipes - return flat array with tag"""
    try:
        all_recipes = Recipe.query.all()
        if all_recipes:
            return jsonify([recipe.to_dict() for recipe in all_recipes])
        else:
            # Fallback if no DB data
            return jsonify(FALLBACK_DATA["free"] + FALLBACK_DATA["premium"])
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify(FALLBACK_DATA["free"] + FALLBACK_DATA["premium"])


@app.route("/recipe/<int:recipe_id>")
def get_recipe(recipe_id):
    """Get single recipe"""
    try:
        recipe = db.session.get(Recipe, recipe_id)
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


# ✅ AUTH ROUTES WITH PROPER ERROR HANDLING
@app.route('/signup', methods=['POST', 'OPTIONS'])
def signup():
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.json
        
        # Validation
        if not data or not data.get('name') or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Check existing user
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 400
        
        # Create user
        user = User(name=data['name'], email=data['email'])
        user.set_password(data['password'])
        db.session.add(user)
        db.session.commit()
        
        print(f"✅ User created: {user.name} ({user.email})")
        return jsonify({'user_id': user.id, 'name': user.name}), 201
        
    except Exception as e:
        print(f"❌ Signup error: {e}")
        db.session.rollback()
        return jsonify({'error': 'Signup failed', 'details': str(e)}), 500


@app.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.json
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Missing email or password'}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        
        if user and user.check_password(data['password']):
            login_user(user)
            print(f"✅ User logged in: {user.name}")
            return jsonify({'user_id': user.id, 'name': user.name}), 200
        
        return jsonify({'error': 'Invalid credentials'}), 401
        
    except Exception as e:
        print(f"❌ Login error: {e}")
        return jsonify({'error': 'Login failed', 'details': str(e)}), 500


@app.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'}), 200


@app.route('/profile/<int:user_id>')
def profile(user_id):
    """Public profile view"""
    try:
        user = db.session.get(User, user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'name': user.name,
            'email': user.email,
            'recipes': [{'id': r.id, 'title': r.title, 'is_paid': r.is_paid} for r in user.recipes]
        })
    except Exception as e:
        print(f"❌ Profile error: {e}")
        return jsonify({'error': 'Failed to load profile'}), 500


@app.route('/recipes/upload', methods=['POST', 'OPTIONS'])
@login_required
def upload_recipe():
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.json
        recipe = Recipe(
            title=data['title'],
            description=data.get('description', ''),
            ingredients=data['ingredients'],
            steps=data['steps'],
            image_url=data.get('image_url', '/images/f1.jpeg'),
            author_id=current_user.id,
            is_paid=data.get('is_paid', False),
            category='PREMIUM' if data.get('is_paid', False) else 'FREE'
        )
        db.session.add(recipe)
        db.session.commit()
        
        print(f"✅ Recipe uploaded: {recipe.title} by {current_user.name}")
        return jsonify({'recipe_id': recipe.id, 'message': 'Recipe uploaded successfully'}), 201
        
    except Exception as e:
        print(f"❌ Upload error: {e}")
        db.session.rollback()
        return jsonify({'error': 'Upload failed', 'details': str(e)}), 500


# Create database tables
with app.app_context():
    try:
        db.create_all()
        print("✅ Database tables created successfully")
    except Exception as e:
        print(f"❌ Database creation error: {e}")


if __name__ == '__main__':
    print("🚀 Starting Flask Recipe API Server...")
    print("📊 Will use database if populated, fallback to hardcoded data otherwise")
    print("🔐 Auth endpoints: /signup, /login, /logout")
    app.run(debug=True, host='127.0.0.1', port=5000)
