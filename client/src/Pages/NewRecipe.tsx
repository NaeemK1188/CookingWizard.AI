import { Link } from 'react-router-dom';
import './NewRecipe.css';

export function NewRecipe() {
  return (
    <div>
      <h1>This is New recipe page</h1>
      <Link to="/">&lt; Back to Homepage</Link>
      <Link to="/recipes">&lt; Navigate to recipes</Link>
      <Link to="/recipes/:recipeId">&lt; Navigate to recipe Details</Link>
    </div>
  );
}
