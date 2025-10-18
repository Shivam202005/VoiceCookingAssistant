from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app) 

RECIPE_DATA = {
    "free": [
        {
            "id": 1,
            "title": "Classic Butter Chicken",
            "desc": "Rich and creamy butter chicken with aromatic spices, perfect with rice or naan.",
            "img": "/images/f1.jpeg",
            "tag": "FREE",
            "cookTime": "45 minutes",
            "servings": 4,
            "difficulty": "Medium",
            "steps": [
                "Cut chicken into bite-sized pieces and marinate with yogurt, ginger-garlic paste, and spices for 30 minutes.",
                "Heat oil in a pan and cook marinated chicken until golden brown, then set aside.",
                "In the same pan, add butter and sauté chopped onions until golden.",
                "Add tomato puree, cook for 5-7 minutes until oil separates.",
                "Add cream, garam masala, and cooked chicken pieces.",
                "Simmer for 10 minutes, garnish with cilantro and serve hot with rice or naan."
            ]
        },
        {
            "id": 2,
            "title": "Vegetable Fried Rice",
            "desc": "Quick and delicious fried rice loaded with colorful vegetables and aromatic flavors.",
            "img": "/images/f1.jpeg",
            "tag": "FREE",
            "cookTime": "20 minutes",
            "servings": 3,
            "difficulty": "Easy",
            "steps": [
                "Cook rice and let it cool completely (preferably day-old rice works best).",
                "Heat oil in a wok or large pan over high heat.",
                "Add chopped garlic and ginger, stir-fry for 30 seconds until fragrant.",
                "Add mixed vegetables (carrots, peas, bell peppers) and stir-fry for 2-3 minutes.",
                "Push vegetables to one side, scramble beaten eggs on the other side.",
                "Add cooked rice, soy sauce, and salt. Toss everything together for 3-4 minutes.",
                "Garnish with chopped scallions and serve hot."
            ]
        },
        {
            "id": 3,
            "title": "Spaghetti Aglio e Olio",
            "desc": "Simple Italian pasta with garlic, olive oil, and red pepper flakes.",
            "img": "/images/f1.jpeg",
            "tag": "FREE",
            "cookTime": "15 minutes",
            "servings": 2,
            "difficulty": "Easy",
            "steps": [
                "Cook spaghetti in salted boiling water according to package instructions until al dente.",
                "While pasta cooks, heat olive oil in a large pan over medium heat.",
                "Add thinly sliced garlic and red pepper flakes, cook until garlic is golden.",
                "Reserve 1 cup pasta water, then drain the spaghetti.",
                "Add drained pasta to the pan with garlic oil and toss well.",
                "Add pasta water gradually to create a silky sauce.",
                "Remove from heat, add chopped parsley and parmesan cheese, serve immediately."
            ]
        },
        {
            "id": 4,
            "title": "Chicken Caesar Salad",
            "desc": "Fresh romaine lettuce with grilled chicken, croutons, and creamy Caesar dressing.",
            "img": "/images/f1.jpeg",
            "tag": "FREE",
            "cookTime": "25 minutes",
            "servings": 4,
            "difficulty": "Easy",
            "steps": [
                "Season chicken breasts with salt, pepper, and herbs, then grill until cooked through.",
                "Let chicken rest for 5 minutes, then slice into strips.",
                "Wash and chop romaine lettuce into bite-sized pieces.",
                "Make Caesar dressing by whisking together mayonnaise, parmesan, lemon juice, and anchovies.",
                "Toast bread cubes in oven until golden to make croutons.",
                "Toss lettuce with dressing in a large bowl.",
                "Top with sliced chicken, croutons, and extra parmesan cheese before serving."
            ]
        },
        {
            "id": 5,
            "title": "Pancakes with Maple Syrup",
            "desc": "Fluffy homemade pancakes perfect for breakfast or brunch.",
            "img": "/images/f1.jpeg",
            "tag": "FREE",
            "cookTime": "20 minutes",
            "servings": 4,
            "difficulty": "Easy",
            "steps": [
                "In a bowl, whisk together flour, sugar, baking powder, and salt.",
                "In another bowl, mix milk, beaten eggs, and melted butter.",
                "Pour wet ingredients into dry ingredients and stir until just combined (don't overmix).",
                "Heat a non-stick pan or griddle over medium heat and lightly grease.",
                "Pour 1/4 cup batter for each pancake and cook until bubbles form on surface.",
                "Flip carefully and cook until golden brown on the other side.",
                "Stack pancakes on plates and serve hot with maple syrup and butter."
            ]
        },
        {
            "id": 6,
            "title": "Tomato Basil Soup",
            "desc": "Creamy and comforting tomato soup with fresh basil.",
            "img": "/images/f1.jpeg",
            "tag": "FREE",
            "cookTime": "30 minutes",
            "servings": 4,
            "difficulty": "Easy",
            "steps": [
                "Heat olive oil in a large pot and sauté diced onions until translucent.",
                "Add minced garlic and cook for another minute until fragrant.",
                "Add canned tomatoes, vegetable broth, and dried herbs.",
                "Bring to boil, then reduce heat and simmer for 20 minutes.",
                "Using an immersion blender, blend soup until smooth.",
                "Stir in heavy cream and fresh basil leaves.",
                "Season with salt and pepper, serve hot with crusty bread."
            ]
        },
        {
            "id": 7,
            "title": "Fish Tacos",
            "desc": "Light and flavorful fish tacos with cabbage slaw and lime crema.",
            "img": "/images/f1.jpeg",
            "tag": "FREE",
            "cookTime": "25 minutes",
            "servings": 4,
            "difficulty": "Medium",
            "steps": [
                "Season fish fillets with cumin, chili powder, and lime juice.",
                "Make slaw by mixing shredded cabbage with lime juice and cilantro.",
                "For crema, mix sour cream with lime zest, garlic, and a pinch of salt.",
                "Heat oil in a pan and cook fish for 3-4 minutes per side until flaky.",
                "Warm tortillas in a dry skillet or microwave.",
                "Break fish into chunks and fill tortillas with fish and slaw.",
                "Drizzle with lime crema, add hot sauce if desired, and serve with lime wedges."
            ]
        },
        {
            "id": 8,
            "title": "Mushroom Risotto",
            "desc": "Creamy Italian rice dish with mushrooms and parmesan cheese.",
            "img": "/images/f1.jpeg",
            "tag": "FREE",
            "cookTime": "35 minutes",
            "servings": 4,
            "difficulty": "Medium",
            "steps": [
                "Heat vegetable or chicken stock in a saucepan and keep warm.",
                "Clean and slice mixed mushrooms, then sauté until golden brown.",
                "In a heavy-bottomed pan, heat olive oil and butter, sauté diced onions.",
                "Add arborio rice and toast for 2 minutes until edges are translucent.",
                "Add white wine and stir until absorbed.",
                "Add warm stock one ladle at a time, stirring constantly until absorbed.",
                "Continue for 18-20 minutes, fold in mushrooms and parmesan, serve immediately."
            ]
        },
        {
            "id": 9,
            "title": "Greek Salad",
            "desc": "Fresh Mediterranean salad with tomatoes, cucumbers, feta, and olives.",
            "img": "/images/f1.jpeg",
            "tag": "FREE",
            "cookTime": "10 minutes",
            "servings": 4,
            "difficulty": "Easy",
            "steps": [
                "Cut tomatoes into wedges and place in a large salad bowl.",
                "Add sliced cucumbers, thinly sliced red onions, and bell peppers.",
                "Add kalamata olives and crumbled feta cheese.",
                "Make dressing by whisking olive oil, lemon juice, oregano, salt, and pepper.",
                "Pour dressing over salad and toss gently to combine.",
                "Let salad sit for 10 minutes to allow flavors to meld.",
                "Serve chilled as a side dish or light meal."
            ]
        },
        {
            "id": 10,
            "title": "Beef Stir Fry",
            "desc": "Quick and healthy stir fry with tender beef and crisp vegetables.",
            "img": "/images/f1.jpeg",
            "tag": "FREE",
            "cookTime": "20 minutes",
            "servings": 4,
            "difficulty": "Medium",
            "steps": [
                "Slice beef thinly against the grain and marinate with soy sauce and cornstarch.",
                "Prepare all vegetables (bell peppers, broccoli, carrots) by cutting into uniform pieces.",
                "Heat wok or large skillet over high heat with oil.",
                "Add marinated beef and stir-fry for 2-3 minutes until browned.",
                "Remove beef, add vegetables starting with hardest ones first.",
                "Return beef to wok, add sauce (soy sauce, oyster sauce, garlic).",
                "Stir-fry for 2 more minutes, serve immediately over steamed rice."
            ]
        },
        {
            "id": 11,
            "title": "Chocolate Chip Cookies",
            "desc": "Classic homemade chocolate chip cookies that are crispy outside and chewy inside.",
            "img": "/images/f1.jpeg",
            "tag": "FREE",
            "cookTime": "25 minutes",
            "servings": 24,
            "difficulty": "Easy",
            "steps": [
                "Preheat oven to 375°F (190°C) and line baking sheets with parchment paper.",
                "Cream together butter, granulated sugar, and brown sugar until fluffy.",
                "Beat in eggs one at a time, then add vanilla extract.",
                "In separate bowl, whisk flour, baking soda, and salt.",
                "Gradually mix dry ingredients into wet ingredients until just combined.",
                "Fold in chocolate chips, then drop rounded tablespoons onto baking sheets.",
                "Bake for 9-11 minutes until edges are golden, cool on sheets for 5 minutes."
            ]
        },
        {
            "id": 12,
            "title": "Chicken Noodle Soup",
            "desc": "Comforting homemade soup with tender chicken, vegetables, and noodles.",
            "img": "/images/f1.jpeg",
            "tag": "FREE",
            "cookTime": "40 minutes",
            "servings": 6,
            "difficulty": "Easy",
            "steps": [
                "In a large pot, heat oil and sauté diced onions, carrots, and celery.",
                "Add garlic and cook for 1 minute until fragrant.",
                "Pour in chicken broth and bring to a boil.",
                "Add chicken breasts and simmer for 20 minutes until cooked through.",
                "Remove chicken, shred when cool, then return to pot.",
                "Add egg noodles and cook according to package directions.",
                "Season with salt, pepper, and fresh herbs before serving hot."
            ]
        },
        {
            "id": 13,
            "title": "Margherita Pizza",
            "desc": "Classic Italian pizza with tomato sauce, mozzarella, and fresh basil.",
            "img": "/images/f1.jpeg",
            "tag": "FREE",
            "cookTime": "30 minutes",
            "servings": 4,
            "difficulty": "Medium",
            "steps": [
                "Preheat oven to 475°F (245°C) and prepare pizza dough or use store-bought.",
                "Roll out dough on floured surface to desired thickness.",
                "Transfer to greased pizza pan or baking sheet.",
                "Spread thin layer of pizza sauce, leaving border for crust.",
                "Add sliced fresh mozzarella cheese evenly over sauce.",
                "Bake for 12-15 minutes until crust is golden and cheese is bubbly.",
                "Remove from oven, top with fresh basil leaves and drizzle with olive oil."
            ]
        },
        {
            "id": 14,
            "title": "Banana Smoothie Bowl",
            "desc": "Healthy and delicious smoothie bowl topped with fresh fruits and granola.",
            "img": "/images/f1.jpeg",
            "tag": "FREE",
            "cookTime": "10 minutes",
            "servings": 2,
            "difficulty": "Easy",
            "steps": [
                "Freeze bananas overnight for best consistency.",
                "In blender, combine frozen bananas, milk, and honey until thick and creamy.",
                "Add vanilla extract and blend until smooth.",
                "Pour smoothie into bowls - it should be thick enough to hold toppings.",
                "Arrange sliced fresh fruits on top (berries, kiwi, banana).",
                "Sprinkle with granola, nuts, and coconut flakes.",
                "Serve immediately with a spoon and enjoy as healthy breakfast."
            ]
        },
        {
            "id": 15,
            "title": "Grilled Salmon",
            "desc": "Perfectly grilled salmon with lemon and herbs, healthy and delicious.",
            "img": "/images/f1.jpeg",
            "tag": "FREE",
            "cookTime": "20 minutes",
            "servings": 4,
            "difficulty": "Medium",
            "steps": [
                "Preheat grill to medium-high heat and oil the grates.",
                "Pat salmon fillets dry and season with salt, pepper, and lemon zest.",
                "Brush salmon with olive oil and add fresh herbs like dill or parsley.",
                "Place salmon skin-side down on grill and cook for 4-5 minutes.",
                "Carefully flip salmon and grill for another 3-4 minutes.",
                "Check internal temperature reaches 145°F (63°C).",
                "Serve immediately with lemon wedges and your favorite side dishes."
            ]
        },
        {
            "id": 16,
            "title": "Vegetable Curry",
            "desc": "Flavorful mixed vegetable curry in coconut milk with aromatic spices.",
            "img": "/images/f1.jpeg",
            "tag": "FREE",
            "cookTime": "35 minutes",
            "servings": 4,
            "difficulty": "Medium",
            "steps": [
                "Heat oil in large pot and sauté diced onions until golden brown.",
                "Add ginger-garlic paste, curry powder, and garam masala, cook for 1 minute.",
                "Add diced tomatoes and cook until they break down into sauce.",
                "Add mixed vegetables (potatoes, carrots, peas, cauliflower) and stir.",
                "Pour in coconut milk and vegetable broth, bring to simmer.",
                "Cook covered for 15-20 minutes until vegetables are tender.",
                "Garnish with cilantro and serve with rice or naan bread."
            ]
        },
        {
            "id": 17,
            "title": "French Toast",
            "desc": "Golden French toast made with thick bread, eggs, and cinnamon.",
            "img": "/images/f1.jpeg",
            "tag": "FREE",
            "cookTime": "15 minutes",
            "servings": 4,
            "difficulty": "Easy",
            "steps": [
                "In shallow dish, whisk together eggs, milk, cinnamon, and vanilla.",
                "Heat butter in large skillet over medium heat.",
                "Dip bread slices in egg mixture, coating both sides completely.",
                "Let excess drip off, then place in hot skillet.",
                "Cook for 2-3 minutes per side until golden brown.",
                "Transfer to plates and keep warm in low oven if making batches.",
                "Serve hot with maple syrup, powdered sugar, and fresh berries."
            ]
        },
        {
            "id": 18,
            "title": "Chicken Quesadillas",
            "desc": "Crispy quesadillas filled with seasoned chicken and melted cheese.",
            "img": "/images/f1.jpeg",
            "tag": "FREE",
            "cookTime": "20 minutes",
            "servings": 4,
            "difficulty": "Easy",
            "steps": [
                "Cook chicken breast with taco seasoning and shred when cooled.",
                "Heat large skillet over medium heat.",
                "Place tortilla in skillet, add shredded cheese on half.",
                "Add seasoned chicken, diced peppers, and onions over cheese.",
                "Top with more cheese and fold tortilla in half.",
                "Cook for 2-3 minutes until bottom is golden and crispy.",
                "Flip carefully and cook another 2 minutes, cut into wedges and serve with salsa."
            ]
        },
        {
            "id": 19,
            "title": "Lemon Garlic Shrimp",
            "desc": "Quick and flavorful shrimp sautéed with lemon, garlic, and herbs.",
            "img": "/images/f1.jpeg",
            "tag": "FREE",
            "cookTime": "15 minutes",
            "servings": 4,
            "difficulty": "Easy",
            "steps": [
                "Peel and devein shrimp, pat dry and season with salt and pepper.",
                "Heat olive oil and butter in large skillet over medium-high heat.",
                "Add minced garlic and cook for 30 seconds until fragrant.",
                "Add shrimp in single layer and cook for 1-2 minutes per side.",
                "Squeeze fresh lemon juice over shrimp and add lemon zest.",
                "Sprinkle with red pepper flakes and chopped parsley.",
                "Serve immediately over pasta, rice, or with crusty bread."
            ]
        },
        {
            "id": 20,
            "title": "Chocolate Mug Cake",
            "desc": "Quick 2-minute chocolate cake that cooks in the microwave.",
            "img": "/images/f1.jpeg",
            "tag": "FREE",
            "cookTime": "5 minutes",
            "servings": 1,
            "difficulty": "Easy",
            "steps": [
                "In microwave-safe mug, whisk together flour, cocoa powder, and sugar.",
                "Add baking powder and salt, mix well to combine dry ingredients.",
                "Pour in milk, melted butter, and vanilla extract.",
                "Stir until batter is smooth with no lumps.",
                "Add chocolate chips if desired and stir into batter.",
                "Microwave on high for 90 seconds to 2 minutes until cake springs back.",
                "Let cool for 1 minute, top with ice cream or whipped cream if desired."
            ]
        }
    ],
    "premium": [
        {
            "id": 21,
            "title": "Truffle Pasta",
            "desc": "Luxurious pasta with truffle oil and parmesan.",
            "img": "/images/f1.jpeg",
            "tag": "PREMIUM",
            "cookTime": "25 minutes",
            "servings": 2,
            "difficulty": "Medium",
            "steps": [
                "Cook pasta until al dente in salted water.",
                "Heat truffle oil in pan with garlic.",
                "Toss pasta with truffle oil and parmesan.",
                "Serve with fresh black pepper."
            ]
        },
        {
    "id": 22,
    "title": "Lobster Thermidor",
    "desc": "Luxurious French dish with lobster in creamy brandy sauce, topped with cheese and broiled to perfection.",
    "img": "/images/f1.jpeg",
    "tag": "PREMIUM",
    "cookTime": "60 minutes",
    "servings": 2,
    "difficulty": "Hard",
    "steps": [
        "Boil lobsters in salted water for 12-15 minutes until bright red, then cool in ice water.",
        "Split lobsters in half lengthwise and remove meat from claws and tail, reserving shells.",
        "Cut lobster meat into bite-sized pieces and set aside, clean the shell halves thoroughly.",
        "In a heavy saucepan, melt butter and sauté minced shallots until translucent.",
        "Add brandy and let it reduce by half, then add heavy cream and bring to gentle simmer.",
        "Whisk in egg yolks, Dijon mustard, and season with salt, white pepper, and cayenne.",
        "Fold in lobster meat and fresh tarragon, cook gently for 2-3 minutes until heated through.",
        "Divide mixture between reserved lobster shells, top with grated Gruyère cheese.",
        "Place under broiler for 3-4 minutes until golden brown and bubbling.",
        "Garnish with fresh parsley and serve immediately with crusty French bread."
    ]
}

    ]
}

@app.route("/recipes")
def get_recipes():
    return jsonify(RECIPE_DATA)

@app.route("/recipe/<int:recipe_id>")
def get_recipe(recipe_id):
    all_recipes = RECIPE_DATA["free"] + RECIPE_DATA["premium"]
    recipe = next((r for r in all_recipes if r["id"] == recipe_id), None)
    return jsonify(recipe) if recipe else ({"error": "Recipe not found"}, 404)

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=False)
