from flask import Flask, jsonify, request
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
from flask_cors import CORS
from models import db, User, Recipe
import os
from dotenv import load_dotenv
import google.generativeai as genai
import traceback 

# Environment variables load karo
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret-key-bhai-ka'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///recipes.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 🔥 SESSION COOKIE SETTINGS
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False
app.config['SESSION_COOKIE_HTTPONLY'] = True

# 🔥 CORS SETTINGS
CORS(app, 
     resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}}, 
     supports_credentials=True)

# 🔥 GEMINI AI SETUP (USING LATEST MODEL FROM YOUR LIST)
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        # 👇 YAHAN HAI MAGIC FIX: 'gemini-2.0-flash' use kar rahe hain
        model = genai.GenerativeModel('gemini-flash-latest')
        print("✅ Gemini AI Connected Successfully! (Model: gemini-2.0-flash)")
    except Exception as e:
        print(f"❌ Gemini Connection Failed: {e}")
else:
    print("⚠️ WARNING: GEMINI_API_KEY nahi mili! .env file check karo.")

# Database & Auth Init
db.init_app(app)
migrate = Migrate(app, db)
bcrypt = Bcrypt(app)

login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.unauthorized_handler
def unauthorized():
    return jsonify({'error': 'Unauthorized', 'message': 'Please log in first'}), 401

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# --- ROUTES ---

@app.route('/ask-ai', methods=['POST'])
def ask_ai():
    print("\n🤖 AI Request Received...")
    try:
        if not GEMINI_API_KEY:
            return jsonify({'answer': "Server config error: API Key missing."}), 500

        data = request.json
        question = data.get('question', '')
        context = data.get('context', {})
        
        print(f"🗣️ User Question: {question}")
        
        # Prepare Context
        title = context.get('title', 'Dish')
        ingredients = ", ".join(context.get('ingredients', []))
        steps = " ".join([f"Step {i+1}: {s}" for i, s in enumerate(context.get('steps', []))])

        # Prompt
        prompt = f"""
        You are 'CookBuddy', an AI Chef.
        Recipe: {title}
        Ingredients: {ingredients}
        Steps: {steps}
        
        User Question: "{question}"
        
        Instructions:
        1. Keep answer SHORT (max 2 sentences) for voice output.
        2. If user asks for substitute, give kitchen alternative.
        3. If user asks to repeat, read the step exactly.
        """
        
        print("⏳ Asking Gemini 2.0...")
        response = model.generate_content(prompt)
        
        if response.text:
            print("✅ AI Replied")
            clean_text = response.text.replace('*', '')
            return jsonify({'answer': clean_text})
        else:
            return jsonify({'answer': "I heard you, but I don't know the answer."})

    except Exception as e:
        print(f"❌ CRITICAL AI ERROR: {e}")
        traceback.print_exc()
        return jsonify({'answer': "My brain is having trouble right now."}), 500

# 1. GET ALL RECIPES
@app.route('/recipes')
def recipes():
    try:
        recipes = Recipe.query.all()
        return jsonify([r.to_dict() for r in recipes])
    except:
        return jsonify([])

# 2. GET SINGLE RECIPE
@app.route("/recipe/<int:recipe_id>")
def get_recipe(recipe_id):
    try:
        recipe = db.session.get(Recipe, recipe_id)
        if recipe:
            return jsonify(recipe.to_dict())
        return jsonify({'error': 'Recipe not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 3. SEARCH RECIPES
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
        return jsonify({'error': 'Invalid credentials'}), 401
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

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    print("🚀 Server Started on Port 5000")
    print("🧠 AI Brain Status: Checking...")
    app.run(debug=True, port=5000)