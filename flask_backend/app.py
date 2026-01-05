from flask import Flask, jsonify, request
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
from flask_cors import CORS
from models import db, User, Recipe
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret-key-bhai-ka'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///recipes.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Session Cookie Settings
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False
app.config['SESSION_COOKIE_HTTPONLY'] = True

# CORS Settings
CORS(app, 
     resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}}, 
     supports_credentials=True)

db.init_app(app)
migrate = Migrate(app, db)
bcrypt = Bcrypt(app)

login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.unauthorized_handler
def unauthorized():
    return jsonify({'error': 'Unauthorized', 'message': 'Please log in to upload'}), 401

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# --- ROUTES ---

# 1. GET ALL RECIPES
@app.route('/recipes')
def recipes():
    try:
        recipes = Recipe.query.all()
        return jsonify([r.to_dict() for r in recipes])
    except:
        return jsonify([])

# 2. GET SINGLE RECIPE (Ye Missing Tha - Isliye 404 aa raha tha) ✅
@app.route("/recipe/<int:recipe_id>")
def get_recipe(recipe_id):
    try:
        recipe = db.session.get(Recipe, recipe_id)
        if recipe:
            return jsonify(recipe.to_dict())
        return jsonify({'error': 'Recipe not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 3. SEARCH RECIPES (Voice Search ke liye zaroori) ✅
@app.route('/search')
def search_recipes():
    query = request.args.get('q', '')
    try:
        recipes = Recipe.query.filter(
            Recipe.title.ilike(f'%{query}%') | 
            Recipe.description.ilike(f'%{query}%')
        ).limit(20).all()
        return jsonify([r.to_dict() for r in recipes])
    except:
        return jsonify([])

# 4. STATS
@app.route('/stats')
def stats():
    try:
        count = Recipe.query.count()
        return jsonify({'total_recipes': count, 'status': 'online'})
    except:
        return jsonify({'total_recipes': 0, 'status': 'db_error'})

# --- AUTH ROUTES ---

@app.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.json
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and Password required'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 400
        
        user = User(name=data.get('name', 'User'), email=data['email'])
        user.set_password(data['password'])
        db.session.add(user)
        db.session.commit()
        
        login_user(user)
        return jsonify({'message': 'Account created', 'user': {'id': user.id, 'name': user.name}}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        user = User.query.filter_by(email=data.get('email')).first()
        if user and user.check_password(data.get('password')):
            login_user(user, remember=True)
            return jsonify({'message': 'Login success', 'user': {'id': user.id, 'name': user.name}}), 200
        return jsonify({'error': 'Invalid email or password'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/logout', methods=['POST'])
def logout():
    logout_user()
    return jsonify({'message': 'Logged out'}), 200

@app.route('/profile/<int:user_id>')
def profile(user_id):
    user = db.session.get(User, user_id)
    if user:
        return jsonify({'name': user.name, 'email': user.email, 'id': user.id})
    return jsonify({'error': 'User not found'}), 404

# --- UPLOAD ROUTE ---
@app.route('/recipes/upload', methods=['POST'])
@login_required
def upload_recipe():
    try:
        data = request.json
        tag = 'PREMIUM' if data.get('is_paid') else 'FREE'
        
        new_recipe = Recipe(
            title=data['title'],
            description=data.get('description', ''),
            image_url=data.get('image_url') or '', 
            ready_in_minutes=int(data.get('cookTime', 30)),
            servings=int(data.get('servings', 2)),
            difficulty=data.get('difficulty', 'Medium'),
            ingredients=data.get('ingredients', []),
            steps=data.get('steps', []),
            author_id=current_user.id,
            category=tag,
            is_paid=data.get('is_paid', False)
        )
        
        db.session.add(new_recipe)
        db.session.commit()
        return jsonify({'message': 'Recipe uploaded successfully!', 'recipe': new_recipe.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to upload recipe'}), 500

# Create Tables
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    print("🚀 Server Started on Port 5000")
    app.run(debug=True, port=5000)