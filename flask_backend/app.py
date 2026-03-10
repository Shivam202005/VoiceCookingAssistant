from flask import Flask, jsonify, request
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
from flask_cors import CORS
from models import db, User, Recipe, Like, Comment
import os
from dotenv import load_dotenv
import google.generativeai as genai
import traceback 
from werkzeug.utils import secure_filename
import json 
import uuid 

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret-key-bhai-ka'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///recipes.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

UPLOAD_FOLDER = 'static/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False
app.config['SESSION_COOKIE_HTTPONLY'] = True

CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}}, supports_credentials=True)

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-flash-latest')
    except Exception as e:
        print(f"❌ Gemini Connection Failed: {e}")

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

# --- PUBLIC ROUTES ---
@app.route('/recipes')
def recipes():
    try:
        # 🔥 Sirf APPROVED recipes show hongi homepage pe
        recipes = Recipe.query.filter_by(status='approved').all()
        return jsonify([r.to_dict() for r in recipes])
    except Exception as e:
        return jsonify([])

@app.route('/search')
def search_recipes():
    query = request.args.get('q', '')
    try:
        # 🔥 Search me bhi sirf APPROVED recipes aayengi
        recipes = Recipe.query.filter(
            (Recipe.title.ilike(f'%{query}%') | Recipe.description.ilike(f'%{query}%')),
            Recipe.status == 'approved'
        ).limit(20).all()
        return jsonify([r.to_dict() for r in recipes])
    except:
        return jsonify([])

@app.route("/recipe/<int:recipe_id>")
def get_recipe(recipe_id):
    try:
        recipe = db.session.get(Recipe, recipe_id)
        if recipe:
            return jsonify(recipe.to_dict())
        return jsonify({'error': 'Recipe not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- AUTH ROUTES ---
@app.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.json
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 400
        
        # 🔥 FIXED: Koi bhi signup karega to by default NORMAL USER banega
        user = User(name=data.get('name', 'User'), email=data['email'], role='user')
        user.set_password(data['password'])
        db.session.add(user)
        db.session.commit()
        
        login_user(user)
        return jsonify({'message': 'Account created', 'user': {'id': user.id, 'name': user.name, 'role': user.role}}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        user = User.query.filter_by(email=data.get('email')).first()
        if user and user.check_password(data.get('password')):
            login_user(user, remember=True)
            return jsonify({'message': 'Login success', 'user': {'id': user.id, 'name': user.name, 'role': user.role}}), 200
        return jsonify({'error': 'Invalid credentials'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/logout', methods=['POST'])
def logout():
    logout_user()
    return jsonify({'message': 'Logged out'}), 200

# --- USER PROFILE & UPLOAD ---
@app.route('/my-profile', methods=['GET'])
@login_required
def my_profile():
    try:
        my_recipes = Recipe.query.filter_by(author_id=current_user.id).all()
        return jsonify({
            'user': {'name': current_user.name, 'email': current_user.email, 'id': current_user.id, 'role': current_user.role},
            'stats': {'total_recipes': len(my_recipes)},
            'recipes': [r.to_dict() for r in my_recipes]
        })
    except Exception as e:
        return jsonify({'error': 'Something went wrong'}), 500

@app.route('/recipes/upload', methods=['POST'])
@login_required
def upload_recipe():
    try:
        title = request.form.get('title')
        description = request.form.get('description', 'Authentic recipe.')
        cook_time = request.form.get('cookTime', 30)
        servings = request.form.get('servings', 2)
        try:
            ingredients = json.loads(request.form.get('ingredients', '[]'))
            steps = json.loads(request.form.get('steps', '[]'))
        except:
            ingredients, steps = [], []

        image_url = ''
        if 'image' in request.files:
            file = request.files['image']
            if file.filename != '':
                filename = secure_filename(file.filename)
                unique_filename = f"{uuid.uuid4().hex}_{filename}"
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
                file.save(file_path)
                image_url = f"http://127.0.0.1:5000/static/uploads/{unique_filename}"

        if not image_url: image_url = request.form.get('image_url') or ''

        # 🔥 Admin upload karega to seedha Approved, warna Pending
        recipe_status = 'approved' if current_user.role == 'admin' else 'pending'

        new_recipe = Recipe(
            title=title, description=description, image_url=image_url,
            ready_in_minutes=int(cook_time), servings=int(servings), difficulty="Medium",
            ingredients=ingredients, steps=steps, author_id=current_user.id,
            country="India", state="All", status=recipe_status
        )
        db.session.add(new_recipe)
        db.session.commit()
        return jsonify({'message': 'Recipe uploaded!', 'recipe': new_recipe.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# 🔥 --- ADMIN ROUTES --- 🔥
@app.route('/admin/pending-recipes', methods=['GET'])
@login_required
def admin_pending_recipes():
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized! Only Admin allowed.'}), 403
    pending = Recipe.query.filter_by(status='pending').all()
    return jsonify([r.to_dict() for r in pending])

@app.route('/admin/recipe/<int:recipe_id>/status', methods=['POST'])
@login_required
def admin_update_status(recipe_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    recipe = db.session.get(Recipe, recipe_id)
    new_status = request.json.get('status') # 'approved' or 'rejected'
    if recipe and new_status in ['approved', 'rejected']:
        recipe.status = new_status
        db.session.commit()
        return jsonify({'message': f'Recipe {new_status} successfully!'})
    return jsonify({'error': 'Failed to update status'}), 400

@app.route('/admin/recipe/<int:recipe_id>/delete', methods=['DELETE'])
@login_required
def admin_delete_recipe(recipe_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    recipe = db.session.get(Recipe, recipe_id)
    if recipe:
        db.session.delete(recipe)
        db.session.commit()
        return jsonify({'message': 'Recipe deleted successfully!'})
    return jsonify({'error': 'Recipe not found'}), 404

@app.route('/admin/recipe/<int:recipe_id>/update-image', methods=['POST'])
@login_required
def admin_update_image(recipe_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403
    
    recipe = db.session.get(Recipe, recipe_id)
    if not recipe:
        return jsonify({'error': 'Recipe not found'}), 404

    if 'image' in request.files:
        file = request.files['image']
        if file.filename != '':
            filename = secure_filename(file.filename)
            unique_filename = f"{uuid.uuid4().hex}_{filename}"
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            file.save(file_path)
            
            image_url = f"http://127.0.0.1:5000/static/uploads/{unique_filename}"
            recipe.image_url = image_url
            db.session.commit()
            return jsonify({'message': 'Image updated successfully!', 'image_url': image_url})
            
    return jsonify({'error': 'No image found in request'}), 400
    
# --- Like & Comment Routes ---
@app.route('/recipe/<int:recipe_id>/like', methods=['POST'])
@login_required
def toggle_like(recipe_id):
    existing_like = Like.query.filter_by(user_id=current_user.id, recipe_id=recipe_id).first()
    if existing_like:
        db.session.delete(existing_like)
    else:
        new_like = Like(user_id=current_user.id, recipe_id=recipe_id)
        db.session.add(new_like)
    db.session.commit()
    recipe = db.session.get(Recipe, recipe_id)
    return jsonify({'likes_count': recipe.likes.count() if hasattr(recipe.likes, 'count') else len(recipe.likes)})

@app.route('/recipe/<int:recipe_id>/is_liked')
@login_required
def is_liked(recipe_id):
    liked = Like.query.filter_by(user_id=current_user.id, recipe_id=recipe_id).first() is not None
    return jsonify({'is_liked': liked})

@app.route('/recipe/<int:recipe_id>/comment', methods=['POST'])
@login_required
def add_comment(recipe_id):
    text = request.json.get('text')
    new_comment = Comment(text=text, user_id=current_user.id, recipe_id=recipe_id)
    db.session.add(new_comment)
    db.session.commit()
    return jsonify({'comment': {'id': new_comment.id, 'text': new_comment.text, 'user': current_user.name, 'date': new_comment.timestamp.strftime('%Y-%m-%d')}})

@app.route('/ask-ai', methods=['POST'])
def ask_ai():
    try:
        data = request.json
        question = data.get('question', '')
        context = data.get('context', {})
        prompt = f"Recipe: {context.get('title')}. User Question: {question}. Answer short in 2 lines."
        response = model.generate_content(prompt)
        return jsonify({'answer': response.text.replace('*', '')})
    except:
        return jsonify({'answer': "Connection error."}), 500

with app.app_context():
    db.create_all()
    
    # 🔥 THE FIXED ADMIN ACCOUNT
    admin_email = "admin@cookbuddy.com"
    if not User.query.filter_by(email=admin_email).first():
        admin_user = User(
            name="Super Admin",
            email=admin_email,
            role="admin"
        )
        admin_user.set_password("admin123") # Secret Password
        db.session.add(admin_user)
        db.session.commit()
        print(f"✅ Fixed Admin Auto-Created -> Email: {admin_email} | Password: admin123")

if __name__ == '__main__':
    print("🚀 Server Started on Port 5000")
    print("🧠 AI Brain Status: Checking...")
    app.run(debug=True, port=5000)