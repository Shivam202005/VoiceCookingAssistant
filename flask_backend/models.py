# models.py
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

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
    
    # Future features (save but don't use this semester)
    cuisines = db.Column(db.JSON)
    diets = db.Column(db.JSON)
    nutrition = db.Column(db.JSON)
    
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
