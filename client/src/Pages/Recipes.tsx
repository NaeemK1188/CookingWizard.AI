import { Link } from 'react-router-dom';
import './Recipes.css';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { type OutletContextType } from './NewRecipe';
import { useOutletContext } from 'react-router-dom';

export function Recipes() {
  const { isopen } = useOutletContext<OutletContextType>();
  return (
    <div className={isopen === true ? 'bg-img-open' : 'bg-img-close'}>
      <div className="container-new-recipe">
        <div className="row">
          <h1 className="font-recipes">Recipes:</h1>
        </div>
        <div className="row">
          <div className="column-half">
            <Link to="/recipes/:recipeId" className="menu-link-recipes">
              <h3 className="h3-recipes">1.new recipe</h3>
            </Link>
          </div>
          <div className="column-half">
            <RiDeleteBin6Line size={25} className="add-margin-recipes" />
          </div>
        </div>
      </div>
    </div>
  );
}

// testing routing
// <div>
//   <h1>This is Recipes page</h1>
//   <Link to="/">&lt; Back to Homepage</Link>
//   <Link to="/new-recipe">&lt; Navigate to New Recipe</Link>
//   <Link to="/recipes/:recipeId">&lt; Navigate to recipe Details</Link>
// </div>
