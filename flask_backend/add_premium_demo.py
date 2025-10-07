# add_premium_demo.py - Simple demo premium recipes
from app import app, db
from models import Recipe

def add_demo_recipes():
    """Add simple demo premium recipes for current semester"""
    with app.app_context():
        
        demo_recipes = [
            {
                'spoonacular_id': 7777001,
                'title': 'Lobster Thermidor',
                'description': 'Luxurious French dish with lobster in creamy sauce, topped with cheese.',
                'image_url': '/images/f1.jpeg',
                'ready_in_minutes': 60,
                'servings': 2,
                'difficulty': 'Hard',
                'ingredients': [
                    {'name': 'lobster', 'original': '2 whole lobsters'},
                    {'name': 'butter', 'original': '4 tbsp butter'},
                    {'name': 'cream', 'original': '1/2 cup heavy cream'},
                    {'name': 'cheese', 'original': '1/2 cup grated cheese'},
                    {'name': 'brandy', 'original': '1/4 cup brandy'}
                ],
                'steps': [
                    'Boil lobsters until cooked, then remove meat from shells.',
                    'Clean shells and cut lobster meat into chunks.',
                    'Make cream sauce with butter, brandy, and cream.',
                    'Mix lobster meat with sauce and fill shells.',
                    'Top with cheese and broil until golden.',
                    'Serve hot with bread.'
                ],
                'category': 'PREMIUM'
            },
            {
                'spoonacular_id': 7777002,
                'title': 'Beef Wellington',
                'description': 'Premium beef tenderloin wrapped in pastry with mushrooms.',
                'image_url': '/images/f1.jpeg',
                'ready_in_minutes': 90,
                'servings': 6,
                'difficulty': 'Hard',
                'ingredients': [
                    {'name': 'beef tenderloin', 'original': '2 lbs beef tenderloin'},
                    {'name': 'puff pastry', 'original': '1 lb puff pastry'},
                    {'name': 'mushrooms', 'original': '1 lb mushrooms, chopped'},
                    {'name': 'prosciutto', 'original': '8 slices prosciutto'}
                ],
                'steps': [
                    'Season and sear beef tenderloin on all sides.',
                    'Cook mushrooms until moisture evaporates.',
                    'Wrap beef in prosciutto and mushroom mixture.',
                    'Wrap in puff pastry and seal edges.',
                    'Bake until pastry is golden and beef is cooked.',
                    'Rest before slicing and serving.'
                ],
                'category': 'PREMIUM'
            },
            {
                'spoonacular_id': 7777003,
                'title': 'Truffle Risotto',
                'description': 'Creamy Italian rice dish with truffle oil and parmesan.',
                'image_url': '/images/f1.jpeg',
                'ready_in_minutes': 40,
                'servings': 4,
                'difficulty': 'Medium',
                'ingredients': [
                    {'name': 'arborio rice', 'original': '1 1/2 cups arborio rice'},
                    {'name': 'chicken stock', 'original': '6 cups warm stock'},
                    {'name': 'truffle oil', 'original': '3 tbsp truffle oil'},
                    {'name': 'parmesan', 'original': '1 cup grated parmesan'},
                    {'name': 'white wine', 'original': '1/2 cup white wine'}
                ],
                'steps': [
                    'Heat stock in separate pot and keep warm.',
                    'Cook rice with wine until absorbed.',
                    'Add stock gradually while stirring constantly.',
                    'Cook until rice is creamy but firm.',
                    'Stir in truffle oil and parmesan.',
                    'Serve immediately while hot.'
                ],
                'category': 'PREMIUM'
            },
            {
                'spoonacular_id': 7777004,
                'title': 'Duck à l\'Orange',
                'description': 'Classic French roasted duck with orange glaze sauce.',
                'image_url': '/images/f1.jpeg',
                'ready_in_minutes': 120,
                'servings': 4,
                'difficulty': 'Hard',
                'ingredients': [
                    {'name': 'whole duck', 'original': '1 whole duck (4-5 lbs)'},
                    {'name': 'orange juice', 'original': '1 cup fresh orange juice'},
                    {'name': 'orange zest', 'original': '2 tbsp orange zest'},
                    {'name': 'honey', 'original': '3 tbsp honey'},
                    {'name': 'butter', 'original': '2 tbsp butter'}
                ],
                'steps': [
                    'Score duck skin and season inside and out.',
                    'Roast duck at 325°F for 2 hours.',
                    'Make orange sauce with juice, zest, and honey.',
                    'Glaze duck with sauce in last 30 minutes.',
                    'Rest duck before carving.',
                    'Serve with remaining sauce.'
                ],
                'category': 'PREMIUM'
            }
        ]
        
        added = 0
        for recipe in demo_recipes:
            try:
                existing = Recipe.query.filter_by(spoonacular_id=recipe['spoonacular_id']).first()
                if not existing:
                    new_recipe = Recipe(**recipe)
                    db.session.add(new_recipe)
                    added += 1
                    print(f"✅ {recipe['title']}")
            except Exception as e:
                print(f"❌ Error: {e}")
        
        db.session.commit()
        
        # Show counts
        free_count = Recipe.query.filter_by(category='FREE').count()
        premium_count = Recipe.query.filter_by(category='PREMIUM').count()
        
        print(f"\n🎉 Added {added} premium recipes!")
        print(f"📊 FREE: {free_count} | PREMIUM: {premium_count}")

if __name__ == '__main__':
    print("🍽️ Adding Demo Premium Recipes...")
    add_demo_recipes()
