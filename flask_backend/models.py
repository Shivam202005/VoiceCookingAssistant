# models.py - FULLY CORRECTED
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class Recipe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    spoonacular_id = db.Column(db.Integer, unique=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    image_url = db.Column(db.String(500))
    
    ready_in_minutes = db.Column(db.Integer)
    servings = db.Column(db.Integer)
    difficulty = db.Column(db.String(20))
    
    ingredients = db.Column(db.JSON)
    steps = db.Column(db.JSON)
    
    # Future features
    cuisines = db.Column(db.JSON)
    diets = db.Column(db.JSON)
    nutrition = db.Column(db.JSON)
    
    # AUTH FIELDS - FIXED INDENT
    author_id = db.Column(db.Integer, db.ForeignKey('users.id', name='fk_recipe_author'), nullable=True)
    is_paid = db.Column(db.Boolean, default=False)
    
    category = db.Column(db.String(20), default='FREE')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'desc': self.description,
            'img': self.image_url or '/images/f1.jpeg',
            'cookTime': f"{self.ready_in_minutes} minutes" if self.ready_in_minutes else "30 minutes",
            'servings': self.servings or 4,
            'difficulty': self.difficulty or 'Medium',
            'tag': self.category,
            'ingredients': self.get_simple_ingredients(),
            'steps': self.steps or []
        }
    
    def get_simple_ingredients(self):
        if not self.ingredients:
            return []
        
        simple_ingredients = []
        for ingredient in self.ingredients:
            if isinstance(ingredient, dict):
                simple_ingredients.append(ingredient.get('original', ingredient.get('name', '')))
            else:
                simple_ingredients.append(str(ingredient))
        
        return simple_ingredients

# USER MODEL
class User(UserMixin, db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    recipes = db.relationship('Recipe', backref='author', lazy=True, foreign_keys='Recipe.author_id')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
