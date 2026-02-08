export interface Ingredient {
  item: string;
  amount: string;
  optional?: boolean;
}

export interface Step {
  id: string;
  title: string;
  instructions: string[];
  durationMinutes: number;
  active: boolean; // requires attention vs waiting
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  cuisine: string;
  totalTimeMinutes: number;
  servings: number;
  ingredients: {
    curry: Ingredient[];
    roti: Ingredient[];
  };
  sections: {
    curry: Step[];
    roti: Step[];
  };
  notes: string[];
}

export const chickenCurryRoti: Recipe = {
  id: "west-indian-curry-roti",
  title: "Chicken Curry with Paratha Roti",
  description: "Traditional West Indian style curry with flaky, buttery paratha roti made from scratch",
  cuisine: "Trinidadian / Guyanese",
  totalTimeMinutes: 120,
  servings: 4,
  ingredients: {
    curry: [
      { item: "Chicken thighs or legs, bone-in", amount: "2 lbs" },
      { item: "Green seasoning (culantro, garlic, thyme blended)", amount: "3 tbsp" },
      { item: "Curry powder (chief or trinidad style)", amount: "2 tbsp" },
      { item: "Garam masala", amount: "1 tsp" },
      { item: "Ground cumin (geera)", amount: "1 tsp" },
      { item: "Turmeric powder", amount: "1/2 tsp" },
      { item: "Scotch bonnet pepper (whole)", amount: "1, optional" },
      { item: "Potatoes, peeled and chunked", amount: "3 medium" },
      { item: "Onion, sliced", amount: "1 large" },
      { item: "Garlic, minced", amount: "4 cloves" },
      { item: "Fresh ginger, grated", amount: "1 tbsp" },
      { item: "Tomato, chopped", amount: "2 medium" },
      { item: "Coconut milk or water", amount: "3 cups" },
      { item: "Vegetable oil", amount: "3 tbsp" },
      { item: "Salt", amount: "to taste" },
      { item: "Black pepper", amount: "1 tsp" },
      { item: "Shadow beni (culantro) or cilantro", amount: "for garnish" },
    ],
    roti: [
      { item: "All-purpose flour", amount: "3 cups" },
      { item: "Baking powder", amount: "2 tsp" },
      { item: "Salt", amount: "1/2 tsp" },
      { item: "Sugar", amount: "1 tsp" },
      { item: "Butter or ghee (room temp)", amount: "3 tbsp + more for cooking" },
      { item: "Warm water", amount: "1 cup" },
      { item: "Vegetable oil for cooking", amount: "as needed" },
    ]
  },
  sections: {
    curry: [
      {
        id: "curry-1",
        title: "Season the chicken",
        instructions: [
          "Wash chicken with lime or vinegar, drain well",
          "Mix green seasoning, 1 tbsp curry powder, salt, pepper",
          "Rub seasoning all over chicken pieces",
          "Cover and marinate for at least 30 minutes (preferably overnight)"
        ],
        durationMinutes: 35,
        active: true
      },
      {
        id: "curry-2",
        title: "Bunjal the curry",
        instructions: [
          "Heat oil in heavy pot over medium-high heat",
          "Mix 1 tbsp curry powder with 2 tbsp water to form slurry",
          "Add curry slurry to hot oil, stir for 30 seconds",
          "Add onion, garlic, ginger - sauté until fragrant (2 minutes)",
          "Let curry darken slightly - this is 'bunjal' and gives deep flavor"
        ],
        durationMinutes: 5,
        active: true
      },
      {
        id: "curry-3",
        title: "Brown the chicken",
        instructions: [
          "Add marinated chicken to pot, skin side down",
          "Let brown for 5 minutes - don't move it too much",
          "Turn chicken pieces, brown other side for 3 minutes",
          "Chicken won't be cooked through - that's fine"
        ],
        durationMinutes: 10,
        active: true
      },
      {
        id: "curry-4",
        title: "Build the curry base",
        instructions: [
          "Add tomatoes, stir and cook 3 minutes",
          "Add garam masala, cumin, turmeric - stir 1 minute",
          "Add coconut milk or water to cover chicken",
          "Add whole scotch bonnet on top (don't break it!)"
        ],
        durationMinutes: 10,
        active: true
      },
      {
        id: "curry-5",
        title: "Simmer the curry",
        instructions: [
          "Bring to boil, then reduce heat to low",
          "Cover and simmer for 30 minutes",
          "Stir occasionally, scraping bottom",
          "Add more liquid if getting too thick"
        ],
        durationMinutes: 30,
        active: false
      },
      {
        id: "curry-6",
        title: "Add potatoes",
        instructions: [
          "Remove chicken pieces to a plate",
          "Add potato chunks to curry sauce",
          "Cook 10 minutes until potatoes start softening",
          "Return chicken to pot, nestle among potatoes"
        ],
        durationMinutes: 15,
        active: true
      },
      {
        id: "curry-7",
        title: "Finish cooking",
        instructions: [
          "Simmer uncovered for 15 more minutes",
          "Sauce should thicken and coat chicken",
          "Potatoes fork-tender, chicken cooked through",
          "Remove scotch bonnet before serving",
          "Garnish with chopped shadow beni"
        ],
        durationMinutes: 15,
        active: false
      }
    ],
    roti: [
      {
        id: "roti-1",
        title: "Make the dough",
        instructions: [
          "Mix flour, baking powder, salt, sugar in large bowl",
          "Rub in 3 tbsp butter until mixture looks like breadcrumbs",
          "Gradually add warm water while mixing",
          "Knead for 5 minutes until smooth and elastic",
          "Dough should be soft but not sticky"
        ],
        durationMinutes: 15,
        active: true
      },
      {
        id: "roti-2",
        title: "Rest the dough",
        instructions: [
          "Form dough into a ball",
          "Rub with a little oil, cover with damp cloth",
          "Let rest for 30 minutes minimum (1 hour ideal)",
          "This relaxes gluten for easier rolling"
        ],
        durationMinutes: 30,
        active: false
      },
      {
        id: "roti-3",
        title: "Divide and shape",
        instructions: [
          "Divide dough into 6 equal pieces",
          "Roll each piece into a ball",
          "Cover with cloth while you work",
          "Lightly oil your rolling surface"
        ],
        durationMinutes: 5,
        active: true
      },
      {
        id: "roti-4",
        title: "Roll out first roti",
        instructions: [
          "Roll one ball into thin circle (about 8 inches)",
          "Spread thin layer of softened butter over surface",
          "Roll up like a cigar, then coil into snail shape",
          "Flatten gently - this creates layers",
          "Roll out again to 8-inch circle carefully"
        ],
        durationMinutes: 15,
        active: true
      },
      {
        id: "roti-5",
        title: "Cook the roti",
        instructions: [
          "Heat flat pan or tawa over medium heat",
          "Cook roti 1-2 minutes until bubbles appear",
          "Flip, cook another 1-2 minutes",
          "Add a little butter or oil, flip and press down",
          "Cook until golden brown spots appear",
          "Keep warm wrapped in clean cloth"
        ],
        durationMinutes: 5,
        active: true
      },
      {
        id: "roti-6",
        title: "Repeat for remaining roti",
        instructions: [
          "Shape and roll next dough ball while first cooks",
          "Stack cooked roti wrapped in cloth to stay soft",
          "Each roti takes 3-4 minutes to cook",
          "Dough can be shaped ahead and cooked when needed"
        ],
        durationMinutes: 30,
        active: true
      }
    ]
  },
  notes: [
    "Bone-in chicken gives better flavor than boneless",
    "Traditional 'green seasoning' is culantro, garlic, thyme - use cilantro if culantro unavailable",
    "Scotch bonnet adds heat without being cut open - flavor without too much fire",
    "Curry tastes better the next day - make ahead if possible",
    "Roti dough can be made morning of, kept wrapped at room temp",
    "For extra flaky roti, brush with ghee and fold/roll twice",
    "Serve curry in center of plate with torn roti around - eat with hands!"
  ]
};

export const recipe = chickenCurryRoti;
export default chickenCurryRoti;
