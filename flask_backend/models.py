from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime

db = SQLAlchemy()

# 1. LIKE TABLE
class Like(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipe.id'), nullable=False)

# 2. COMMENT TABLE
class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipe.id'), nullable=False)
    
    # User ka naam lane ke liye relationship
    user = db.relationship('User', backref='comments')

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(150), nullable=False)

    def set_password(self, password):
        from flask_bcrypt import generate_password_hash
        self.password_hash = generate_password_hash(password).decode('utf8')

    def check_password(self, password):
        from flask_bcrypt import check_password_hash
        return check_password_hash(self.password_hash, password)

class Recipe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    image_url = db.Column(db.String(300))
    ready_in_minutes = db.Column(db.Integer)
    servings = db.Column(db.Integer)
    difficulty = db.Column(db.String(20))
    
    ingredients = db.Column(db.JSON)
    steps = db.Column(db.JSON)
    
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    category = db.Column(db.String(20), default='FREE') # FREE or PREMIUM
    is_paid = db.Column(db.Boolean, default=False)
    
    # Relationships
    likes = db.relationship('Like', backref='recipe', lazy='dynamic')
    comments = db.relationship('Comment', backref='recipe', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'image_url': self.image_url,
            'cookTime': self.ready_in_minutes, # Frontend expects cookTime
            'ready_in_minutes': self.ready_in_minutes,
            'servings': self.servings,
            'difficulty': self.difficulty,
            'ingredients': self.ingredients,
            'steps': self.steps,
            
            # 👇 YAHAN THA MAIN FIX
            'category': self.category, # Database column name
            'tag': self.category,      # ✅ FIX: Frontend 'tag' maang raha hai, isliye copy kiya
            
            'is_paid': self.is_paid,
            'author_id': self.author_id,
            'likes_count': self.likes.count(),
            'comments': [{
                'id': c.id,
                'text': c.text,
                'user': c.user.name,
                'date': c.timestamp.strftime('%Y-%m-%d')
            } for c in self.comments]
        }