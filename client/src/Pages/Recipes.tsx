import { Link } from 'react-router-dom';
import './Recipes.css';

export function Recipes() {
  return (
    <div>
      <h1>This is Recipes page</h1>
      <Link to="/">&lt; Back to Homepage</Link>
      <Link to="/new-recipe">&lt; Navigate to New Recipe</Link>
      <Link to="/recipes/:recipeId">&lt; Navigate to recipe Details</Link>
    </div>
  );
}
