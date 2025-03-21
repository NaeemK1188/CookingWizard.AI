import { Link } from 'react-router-dom';
import './RecipeDetails.css';

export function RecipeDetails() {
  return (
    <div className="bg-img">
      <div className="container-new-recipe">
        <div className="row">
          <h1 className="font-recipes">Recipes:</h1>
        </div>
        <div className="row">
          <div className="column-half">
            <Link to="/recipes/:recipeId" className="menu-link-recipes">
              <h3 className="h3-rec-details">1.new recipe</h3>
            </Link>
          </div>
        </div>
        <div className="row">
          <p className="text-align-rec-details">
            1.Tomato-Potato Rice Delight 🍅🥔🍚 Ingredients: 1 cup rice 2 medium
            potatoes, diced 2 large tomatoes, chopped 2 cups water 1 tbsp oil
            (if available) 1 tsp salt ½ tsp black pepper (optional) ½ tsp
            paprika or chili powder (optional) Instructions: Cook the rice: In a
            pot, bring 2 cups of water to a boil. Add the rice and a pinch of
            salt. Lower the heat, cover, and let it simmer until the rice is
            fully cooked (about 15 minutes). Sauté the potatoes: In a pan, heat
            oil (if available) and add diced potatoes. Cook until golden and
            slightly crispy. Add tomatoes: Toss in the chopped tomatoes,
            stirring occasionally. Cook until they soften and release their
            juices, creating a light sauce. Season the dish: Add salt, black
            pepper, and any spices you have. Stir well and let everything cook
            together for 5 more minutes. Combine with rice: Mix the cooked rice
            into the pan with potatoes and tomatoes. Stir well so the flavors
            blend. Serve warm: Enjoy your simple yet delicious Tomato-Potato
            Rice Delight!
          </p>
        </div>
      </div>
    </div>
  );
}

//---------------testing routing ---------------------------------
// <div>
//   <h1>This is Recipes details</h1>
//   <Link to="/">&lt; Back to Homepage</Link>
//   <Link to="/new-recipe">&lt; Navigate to New Recipe</Link>
//   <Link to="/recipes">&lt; Navigate to recipes</Link>
// </div>
//---------------testing routing ---------------------------------
