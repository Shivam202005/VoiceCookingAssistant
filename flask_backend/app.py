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
from werkzeug.utils import secure_filename
import json # JSON parsing ke liye
import uuid # Unique filename banane ke liye
# Upar import line me Like aur Comment add karo
from models import db, User, Recipe, Like, Comment
# Environment variables load karo
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret-key-bhai-ka'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///recipes.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 🔥 FILE UPLOAD CONFIGURATION
UPLOAD_FOLDER = 'static/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# 🔥 SESSION COOKIE SETTINGS
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False
app.config['SESSION_COOKIE_HTTPONLY'] = True

# 🔥 CORS SETTINGS
CORS(app, 
     resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}}, 
     supports_credentials=True)

# 🔥 GEMINI AI SETUP
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        # Using the stable free tier model
        model = genai.GenerativeModel('gemini-flash-latest')
        print("✅ Gemini AI Connected Successfully!")
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
        
        print("⏳ Asking Gemini...")
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
    # try-except hata diya taaki asli error dikhe agar koi ho
    recipes = Recipe.query.all()
    return jsonify([r.to_dict() for r in recipes])

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

@app.route('/my-profile', methods=['GET'])
@login_required
def my_profile():
    try:
        # 1. User ki recipes nikalo
        my_recipes = Recipe.query.filter_by(author_id=current_user.id).all()
        
        # 2. Response banao
        return jsonify({
            'user': {
                'name': current_user.name,
                'email': current_user.email,
                'id': current_user.id
            },
            'stats': {
                'total_recipes': len(my_recipes)
            },
            'recipes': [r.to_dict() for r in my_recipes]
        })
    except Exception as e:
        print(e)
        return jsonify({'error': 'Something went wrong'}), 500

# --- 🔥 NEW UPLOAD ROUTE (HANDLES FILE UPLOAD) ---
@app.route('/recipes/upload', methods=['POST'])
@login_required
def upload_recipe():
    try:
        print("📝 Upload Request Received...")
        
        # Note: 'request.form' use karenge kyunki FormData aa raha hai
        title = request.form.get('title')
        description = request.form.get('description')
        cook_time = request.form.get('cookTime')
        servings = request.form.get('servings')
        
        # JSON Strings ko wapas Python List banayenge
        ingredients = json.loads(request.form.get('ingredients'))
        steps = json.loads(request.form.get('steps'))
        
        is_paid = request.form.get('is_paid') == 'true'
        tag = 'PREMIUM' if is_paid else 'FREE'

        image_url = ''

        # 📸 FILE SAVE LOGIC
        if 'image' in request.files:
            file = request.files['image']
            if file.filename != '':
                filename = secure_filename(file.filename)
                # Unique filename taaki overwrite na ho
                unique_filename = f"{uuid.uuid4().hex}_{filename}"
                
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
                file.save(file_path)
                
                # Image URL generate karo (Server address ke saath)
                # Note: Production me domain name use hoga, abhi localhost
                image_url = f"http://127.0.0.1:5000/static/uploads/{unique_filename}"
                print(f"📸 Image Saved at: {image_url}")

        # Agar file nahi di, aur user ne URL diya hai
        if not image_url:
            image_url = request.form.get('image_url') or ''

        new_recipe = Recipe(
            title=title,
            description=description,
            image_url=image_url,
            ready_in_minutes=int(cook_time),
            servings=int(servings),
            difficulty="Medium",
            ingredients=ingredients,
            steps=steps,
            author_id=current_user.id,
            category=tag,
            is_paid=is_paid
        )
        
        db.session.add(new_recipe)
        db.session.commit()
        print("✅ Recipe Saved to DB!")
        return jsonify({'message': 'Recipe uploaded successfully!', 'recipe': new_recipe.to_dict()}), 201

    except Exception as e:
        print(f"❌ Upload Error: {e}")
        traceback.print_exc()
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Create Tables
with app.app_context():
    db.create_all()

# --- ❤️ LIKE & COMMENT ROUTES ---

@app.route('/recipe/<int:recipe_id>/like', methods=['POST'])
@login_required
def toggle_like(recipe_id):
    try:
        # Check if already liked
        existing_like = Like.query.filter_by(user_id=current_user.id, recipe_id=recipe_id).first()
        
        if existing_like:
            db.session.delete(existing_like)
            action = 'unliked'
        else:
            new_like = Like(user_id=current_user.id, recipe_id=recipe_id)
            db.session.add(new_like)
            action = 'liked'
            
        db.session.commit()
        
        # Return updated count
        recipe = db.session.get(Recipe, recipe_id)
        return jsonify({'message': f'Recipe {action}', 'likes_count': recipe.likes.count()})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/recipe/<int:recipe_id>/comment', methods=['POST'])
@login_required
def add_comment(recipe_id):
    try:
        data = request.json
        text = data.get('text')
        
        if not text:
            return jsonify({'error': 'Comment cannot be empty'}), 400
            
        new_comment = Comment(text=text, user_id=current_user.id, recipe_id=recipe_id)
        db.session.add(new_comment)
        db.session.commit()
        
        return jsonify({
            'message': 'Comment added',
            'comment': {
                'id': new_comment.id,
                'text': new_comment.text,
                'user': current_user.name,
                'date': new_comment.timestamp.strftime('%Y-%m-%d')
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Helper to check if current user liked a recipe
@app.route('/recipe/<int:recipe_id>/is_liked')
@login_required
def is_liked(recipe_id):
    liked = Like.query.filter_by(user_id=current_user.id, recipe_id=recipe_id).first() is not None
    return jsonify({'is_liked': liked})

if __name__ == '__main__':
    print("🚀 Server Started on Port 5000")
    print("🧠 AI Brain Status: Checking...")
    app.run(debug=True, port=5000)