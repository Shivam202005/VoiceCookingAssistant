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

# 🔥 FINAL CORS FIX (Sabse Important Line)
# Hum yahan bata rahe hain ki React kahan se aa sakta hai.
# Dono allow kar diye taaki koi error na aaye.
CORS(app, 
     resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}}, 
     supports_credentials=True)

db.init_app(app)
migrate = Migrate(app, db)
bcrypt = Bcrypt(app)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# --- ROUTES ---

@app.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.json
        print(f"🚀 Signup Attempt from: {data.get('email')}") # Terminal me dikhega

        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and Password required'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 400
        
        user = User(name=data.get('name', 'User'), email=data['email'])
        user.set_password(data['password'])
        db.session.add(user)
        db.session.commit()
        
        login_user(user)
        print("✅ User Created & Logged In!")
        return jsonify({'message': 'Account created', 'user': {'id': user.id, 'name': user.name}}), 201

    except Exception as e:
        print(f"❌ Signup Error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        user = User.query.filter_by(email=data.get('email')).first()
        if user and user.check_password(data.get('password')):
            login_user(user)
            print(f"✅ Login Success: {user.name}")
            return jsonify({'message': 'Login success', 'user': {'id': user.id, 'name': user.name}}), 200
        print("❌ Login Failed: Invalid credentials")
        return jsonify({'error': 'Invalid credentials'}), 401
    except Exception as e:
        print(f"❌ Login Error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/logout', methods=['POST'])
def logout():
    logout_user()
    return jsonify({'message': 'Logged out'}), 200

@app.route('/profile/<int:user_id>')
def profile(user_id):
    user = db.session.get(User, user_id)
    if user:
        return jsonify({'name': user.name, 'email': user.email})
    return jsonify({'error': 'User not found'}), 404

# Stats route
@app.route('/stats')
def stats():
    try:
        count = Recipe.query.count()
        return jsonify({'total_recipes': count, 'status': 'online'})
    except:
        return jsonify({'total_recipes': 0, 'status': 'db_error'})

# Recipe list route
@app.route('/recipes')
def recipes():
    try:
        recipes = Recipe.query.all()
        return jsonify([r.to_dict() for r in recipes])
    except:
        return jsonify([])



# Tables create
with app.app_context():
    db.create_all()


# ... (Baki code same rahega)

# 👇 IS CODE KO app.py MEIN ROUTES SECTION KE END MEIN ADD KARO 👇

@app.route('/recipes/upload', methods=['POST'])
@login_required
def upload_recipe():
    try:
        data = request.json
        print(f"📝 New Recipe Upload: {data.get('title')} by {current_user.name}")
        
        # Determine Tag based on is_paid
        tag = 'PREMIUM' if data.get('is_paid') else 'FREE'
        
        new_recipe = Recipe(
            title=data['title'],
            description=data['description'],
            image_url=data.get('image_url') or 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c', # Default food image
            ready_in_minutes=int(data.get('cookTime', 30)),
            servings=int(data.get('servings', 2)),
            difficulty=data.get('difficulty', 'Medium'),
            ingredients=data.get('ingredients', []), # Array of strings
            steps=data.get('steps', []),             # Array of strings
            author_id=current_user.id,
            category=tag,
            is_paid=data.get('is_paid', False)
        )
        
        db.session.add(new_recipe)
        db.session.commit()
        
        return jsonify({
            'message': 'Recipe uploaded successfully!', 
            'recipe': new_recipe.to_dict()
        }), 201

    except Exception as e:
        print(f"❌ Upload Error: {e}")
        db.session.rollback()
        return jsonify({'error': 'Failed to upload recipe'}), 500
if __name__ == '__main__':
    print("🚀 Server Started! Waiting for requests...")
    app.run(debug=True, port=5000)