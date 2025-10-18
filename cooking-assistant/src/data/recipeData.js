// src/data/recipeData.js
export const FREE_RECIPES = [
    { 
      id: 1,
      title: "Savory Herb-Crusted Salmon", 
      desc: "A healthy and flavorful salmon dish with fresh herbs and crispy coating. Perfect for dinner.", 
      img: "/images/f1.jpeg", 
      tag: "FREE",
      cookTime: "30 minutes",
      servings: 4,
      difficulty: "Easy",
      steps: [
        "Preheat oven to 400°F (200°C) and line a baking sheet with parchment paper.",
        "Pat salmon fillets dry and season both sides with salt and black pepper.",
        "In a small bowl, mix chopped parsley, dill, garlic powder, lemon zest, and olive oil.",
        "Spread the herb mixture evenly over the top of each salmon fillet.",
        "Bake for 12-15 minutes or until fish flakes easily with a fork.",
        "Let rest for 2-3 minutes before serving with lemon wedges.",
        "Serve immediately with your favorite side dishes."
      ]
    },
    { 
      id: 2,
      title: "Spicy Thai Peanut Noodles", 
      desc: "A quick and easy noodle recipe with authentic Thai flavors and creamy peanut sauce.", 
      img: "/images/f1.jpeg", 
      tag: "FREE",
      cookTime: "20 minutes",
      servings: 3,
      difficulty: "Medium",
      steps: [
        "Cook rice noodles according to package instructions. Drain and set aside.",
        "In a large pan, heat vegetable oil over medium-high heat.",
        "Add sliced bell peppers, carrots, and snap peas. Stir-fry for 3-4 minutes.",
        "In a bowl, whisk together peanut butter, soy sauce, sriracha, lime juice, and brown sugar.",
        "Add cooked noodles to the pan with vegetables.",
        "Pour peanut sauce over noodles and toss everything together.",
        "Garnish with crushed peanuts, cilantro, and lime wedges before serving."
      ]
    },
  ];
  
  export const PREMIUM_RECIPES = [
    { 
      id: 3,
      title: "Mediterranean Quinoa Salad", 
      desc: "A refreshing and nutritious salad packed with Mediterranean vegetables and quinoa.", 
      img: "/images/f1.jpeg", 
      tag: "PREMIUM",
      cookTime: "25 minutes",
      servings: 6,
      difficulty: "Easy",
      steps: [
        "Rinse quinoa thoroughly under cold water until water runs clear.",
        "In a saucepan, bring 2 cups of water to boil. Add quinoa and reduce heat to low.",
        "Cover and simmer for 15 minutes until water is absorbed. Let cool completely.",
        "Dice cucumber, cherry tomatoes, red onion, and bell peppers into small pieces.",
        "Crumble feta cheese and roughly chop Kalamata olives.",
        "In a large bowl, combine cooled quinoa with all vegetables and cheese.",
        "Whisk together olive oil, lemon juice, oregano, salt, and pepper for dressing.",
        "Pour dressing overr salad and toss gently. Chill for 30 minutes before serving."
      ]
    },
    { 
      id: 4,
      title: "Creamy Avocado Pasta", 
      desc: "A rich and creamy pasta dish made with fresh avocados and aromatic herbs.", 
      img: "/images/f1.jpeg", 
      tag: "PREMIUM",
      cookTime: "15 minutes",
      servings: 4,
      difficulty: "Easy",
      steps: [
        "Cook pasta according to package directions until al dente. Reserve 1 cup pasta water.",
        "While pasta cooks, halve and pit 2 ripe avocados. Scoop flesh into a blender.",
        "Add garlic, lemon juice, basil leaves, and olive oil to blender with avocados.",
        "Blend until smooth and creamy. Season with salt and pepper to taste.",
        "Drain pasta and return to pot over low heat.",
        "Add avocado sauce to pasta and toss gently, adding pasta water if needed.",
        "Serve immediately topped with cherry tomatoes, pine nuts, and extra basil."
      ]
    },
  ];
  
  export const ALL_RECIPES = [...FREE_RECIPES, ...PREMIUM_RECIPES];
  