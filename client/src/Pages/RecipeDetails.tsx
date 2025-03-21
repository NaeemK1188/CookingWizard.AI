import { Link } from 'react-router-dom';
import './RecipeDetails.css';

export function RecipeDetails() {
  return (
    <div>
      <h1>This is Recipes details</h1>
      <Link to="/">&lt; Back to Homepage</Link>
      <Link to="/new-recipe">&lt; Navigate to New Recipe</Link>
      <Link to="/recipes">&lt; Navigate to recipes</Link>
    </div>
  );
}
