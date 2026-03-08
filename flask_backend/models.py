from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime

db = SQLAlchemy()

class Like(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipe.id'), nullable=False)

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipe.id'), nullable=False)
    user = db.relationship('User', backref='comments')

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(150), nullable=False)
    
    # 🔥 NEW: Admin Role
    role = db.Column(db.String(20), default='user') # 'admin' or 'user'

    def set_password(self, password):
        from flask_bcrypt import generate_password_hash
        self.password_hash = generate_password_hash(password).decode('utf8')

    def check_password(self, password):
        from flask_bcrypt import check_password_hash
        return check_password_hash(self.password_hash, password)

class Recipe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    spoonacular_id = db.Column(db.Integer, unique=True, nullable=True) 
    
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    image_url = db.Column(db.String(300))
    ready_in_minutes = db.Column(db.Integer)
    servings = db.Column(db.Integer)
    difficulty = db.Column(db.String(20))
    
    ingredients = db.Column(db.JSON)
    steps = db.Column(db.JSON)
    
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    country = db.Column(db.String(50), default='India')
    state = db.Column(db.String(50), nullable=True) 
    
    # 🔥 NEW: Recipe Status (pending, approved, rejected)
    status = db.Column(db.String(20), default='approved') 
    
    likes = db.relationship('Like', backref='recipe', lazy='dynamic')
    comments = db.relationship('Comment', backref='recipe', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'image_url': self.image_url,
            'cookTime': self.ready_in_minutes,
            'ready_in_minutes': self.ready_in_minutes,
            'servings': self.servings,
            'difficulty': self.difficulty,
            'ingredients': self.ingredients,
            'steps': self.steps,
            'country': self.country,
            'state': self.state,
            'author_id': self.author_id,
            'status': self.status, # 🔥 Added Status
            'likes_count': self.likes.count() if hasattr(self.likes, 'count') else len(self.likes),
            'comments': [{
                'id': c.id,
                'text': c.text,
                'user': c.user.name,
                'date': c.timestamp.strftime('%Y-%m-%d')
            } for c in self.comments]
        }