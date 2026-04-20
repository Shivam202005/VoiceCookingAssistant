import os
import json
import uuid
import traceback
import re
from flask import Flask, jsonify, request, url_for
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
from flask_cors import CORS
from werkzeug.utils import secure_filename
import google.generativeai as genai
from dotenv import load_dotenv
from models import db, User, Recipe, Like, Comment

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'secret-key-bhai-ka')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///recipes.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

UPLOAD_FOLDER = os.path.join('static', 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False
app.config['SESSION_COOKIE_HTTPONLY'] = True

CORS(app, resources={r"/*": {
    "origins": ["http://localhost:5173", "http://127.0.0.1:5173"]
}}, supports_credentials=True)

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
model = None
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
    return db.session.get(User, int(user_id))

translation_cache = {}

@app.route('/recipes')
def recipes():
    try:
        recipes = Recipe.query.filter_by(status='approved').all()
        return jsonify([r.to_dict() for r in recipes])
    except Exception as e:
        return jsonify([])

@app.route('/search')
def search_recipes():
    query = request.args.get('q', '')
    try:
        recipes = Recipe.query.filter(
            (Recipe.title.ilike(f'%{query}%') | Recipe.description.ilike(f'%{query}%')),
            Recipe.status == 'approved'
        ).limit(20).all()
        return jsonify([r.to_dict() for r in recipes])
    except:
        return jsonify([])

@app.route("/recipe/<int:recipe_id>")
def get_recipe(recipe_id):
    recipe = db.session.get(Recipe, recipe_id)
    if recipe:
        return jsonify(recipe.to_dict())
    return jsonify({'error': 'Recipe not found'}), 404

@app.route('/translate-recipe', methods=['POST'])
def translate_recipe():
    data = request.json
    recipe_data = data.get('recipe')
    target_lang = data.get('lang') 
    
    if target_lang == 'en' or not recipe_data or not model:
        return jsonify(recipe_data)
        
    recipe_id = recipe_data.get('id', 'unknown')
    cache_key = f"{recipe_id}_{target_lang}"
    
    if cache_key in translation_cache:
        print(f"✅ Served from Cache: {cache_key}")
        return jsonify(translation_cache[cache_key])
        
    lang_name = "Hindi" if target_lang == 'hi' else "Marathi"
    
    prompt = f"""
    Translate the following JSON into {lang_name} (Devanagari script). 
    Translate 'title', 'description', 'ingredients', and 'steps'.
    CRITICAL: Output ONLY a valid JSON object. No markdown.
    
    {json.dumps({
        'title': recipe_data.get('title', ''),
        'description': recipe_data.get('description', ''),
        'ingredients': recipe_data.get('ingredients', []),
        'steps': recipe_data.get('steps', [])
    }, ensure_ascii=False)}
    """
    
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            clean_json = match.group(0)
            translated_json = json.loads(clean_json)
            final_recipe = {**recipe_data, **translated_json}
            translation_cache[cache_key] = final_recipe
            return jsonify(final_recipe)
        else:
            raise ValueError("No JSON format found in AI response")
            
    except Exception as e:
        print(f"❌ Translation Failed: {e}")
        return jsonify(recipe_data) 

# --- ASK AI ROUTE ---
@app.route('/ask-ai', methods=['POST'])
def ask_ai():
    data = request.json
    question = data.get('question', '')
    mode = data.get('mode', 'general')
    
    if not model:
        return jsonify({'answer': question}), 200 

    try:
        context = data.get('context', {})
        target_lang = data.get('lang', 'en')
        
        if mode == 'search':
            prompt = f"""
            Extract ONLY the core food dish name from this text.
            Translate it to English. 
            DO NOT output sentences. Just the English word.
            Text: "{question}"
            """
            response = model.generate_content(prompt)
            ans = response.text.replace('.', '').replace('"', '').replace("'", '').strip().lower()
            return jsonify({'answer': ans})
        else:
            lang_str = "Hindi" if target_lang == 'hi' else "Marathi" if target_lang == 'mr' else "English"
            prompt = f"Answer briefly in {lang_str}: {question}. Context: {context.get('title','')}"
            response = model.generate_content(prompt)
            return jsonify({'answer': response.text.replace('*', '').strip()})
            
    except Exception as e:
        print(f"AI Error: {e}")
        return jsonify({'answer': question}), 200 

# --- AUTH & OTHER ROUTES ---
@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    if User.query.filter_by(email=data.get('email')).first(): return jsonify({'error': 'Email exists'}), 400
    user = User(name=data.get('name', 'User'), email=data.get('email'), role='user')
    user.set_password(data.get('password'))
    db.session.add(user)
    db.session.commit()
    login_user(user)
    return jsonify({'message': 'Account created', 'user': {'id': user.id, 'name': user.name, 'role': user.role}}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data.get('email')).first()
    if user and user.check_password(data.get('password')):
        login_user(user, remember=True)
        return jsonify({'message': 'Login success', 'user': {'id': user.id, 'name': user.name, 'role': user.role}}), 200
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out'}), 200

@app.route('/my-profile', methods=['GET'])
@login_required
def my_profile():
    my_recipes = Recipe.query.filter_by(author_id=current_user.id).all()
    return jsonify({'user': {'name': current_user.name, 'email': current_user.email, 'id': current_user.id, 'role': current_user.role}, 'stats': {'total_recipes': len(my_recipes)}, 'recipes': [r.to_dict() for r in my_recipes]})

@app.route('/recipes/upload', methods=['POST'])
@login_required
def upload_recipe():
    try:
        title = request.form.get('title')
        description = request.form.get('description', '')
        cook_time = request.form.get('cookTime', 30)
        servings = request.form.get('servings', 2)
        try: ingredients, steps = json.loads(request.form.get('ingredients', '[]')), json.loads(request.form.get('steps', '[]'))
        except: ingredients, steps = [], []
        image_url = request.form.get('image_url', '')
        if 'image' in request.files:
            file = request.files['image']
            if file and file.filename != '':
                filename = secure_filename(file.filename)
                unique_filename = f"{uuid.uuid4().hex}_{filename}"
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
                file.save(file_path)
                image_url = f"{request.host_url}static/uploads/{unique_filename}"
        status = 'approved' if current_user.role == 'admin' else 'pending'
        new_recipe = Recipe(title=title, description=description, image_url=image_url, ready_in_minutes=int(cook_time), servings=int(servings), difficulty="Medium", ingredients=ingredients, steps=steps, author_id=current_user.id, status=status)
        db.session.add(new_recipe)
        db.session.commit()
        return jsonify({'message': 'Recipe submitted!', 'recipe': new_recipe.to_dict()}), 201
    except Exception as e: return jsonify({'error': 'Upload failed'}), 500

@app.route('/recipe/<int:recipe_id>/like', methods=['POST'])
@login_required
def toggle_like(recipe_id):
    existing = Like.query.filter_by(user_id=current_user.id, recipe_id=recipe_id).first()
    if existing: db.session.delete(existing)
    else: db.session.add(Like(user_id=current_user.id, recipe_id=recipe_id))
    db.session.commit()
    return jsonify({'likes_count': Like.query.filter_by(recipe_id=recipe_id).count()})

@app.route('/recipe/<int:recipe_id>/is_liked')
@login_required
def is_liked(recipe_id):
    return jsonify({'is_liked': Like.query.filter_by(user_id=current_user.id, recipe_id=recipe_id).first() is not None})

@app.route('/recipe/<int:recipe_id>/comment', methods=['POST'])
@login_required
def add_comment(recipe_id):
    new_comment = Comment(text=request.json.get('text'), user_id=current_user.id, recipe_id=recipe_id)
    db.session.add(new_comment)
    db.session.commit()
    return jsonify({'comment': {'id': new_comment.id, 'text': new_comment.text, 'user': current_user.name, 'date': new_comment.timestamp.strftime('%Y-%m-%d')}})

@app.route('/admin/pending-recipes')
@login_required
def admin_pending_recipes():
    if current_user.role != 'admin': return jsonify({'error': 'Forbidden'}), 403
    return jsonify([r.to_dict() for r in Recipe.query.filter_by(status='pending').all()])

@app.route('/admin/recipe/<int:recipe_id>/status', methods=['POST'])
@login_required
def admin_update_status(recipe_id):
    if current_user.role != 'admin': return jsonify({'error': 'Forbidden'}), 403
    recipe = db.session.get(Recipe, recipe_id)
    new_status = request.json.get('status')
    if recipe and new_status in ['approved', 'rejected']:
        recipe.status = new_status
        db.session.commit()
        return jsonify({'message': f'Recipe {new_status}'})
    return jsonify({'error': 'Invalid request'}), 400

@app.route('/admin/recipe/<int:recipe_id>/delete', methods=['DELETE'])
@login_required
def admin_delete_recipe(recipe_id):
    if current_user.role != 'admin': return jsonify({'error': 'Unauthorized'}), 403
    recipe = db.session.get(Recipe, recipe_id)
    if recipe:
        db.session.delete(recipe)
        db.session.commit()
        return jsonify({'message': 'Recipe deleted successfully!'})
    return jsonify({'error': 'Recipe not found'}), 404

@app.route('/admin/recipe/<int:recipe_id>/update-image', methods=['POST'])
@login_required
def admin_update_image(recipe_id):
    if current_user.role != 'admin': return jsonify({'error': 'Unauthorized'}), 403
    recipe = db.session.get(Recipe, recipe_id)
    if 'image' in request.files:
        file = request.files['image']
        if file and file.filename != '':
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{uuid.uuid4().hex}_{filename}")
            file.save(file_path)
            recipe.image_url = f"{request.host_url}{file_path}"
            db.session.commit()
            return jsonify({'message': 'Updated!', 'image_url': recipe.image_url})
    return jsonify({'error': 'Failed'}), 400

with app.app_context():
    db.create_all()
    if not User.query.filter_by(email="admin@cookbuddy.com").first():
        admin = User(name="Super Admin", email="admin@cookbuddy.com", role="admin")
        admin.set_password("admin123")
        db.session.add(admin)
        db.session.commit()

if __name__ == '__main__':
    app.run(debug=True, port=5000)