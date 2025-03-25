import { Link } from 'react-router-dom';
import './Recipes.css';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { type OutletContextType } from './NewRecipe';
import { useOutletContext } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { type Recipe } from '../App';

export function Recipes() {
  const { isopen } = useOutletContext<OutletContextType>();
  const [newRecipes, setNewRecipe] = useState<Recipe[]>([]);
  const [error, setError] = useState<unknown>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRecipes() {
      try {
        const response2 = await fetch('/api/recipes');
        if (!response2.ok) {
          throw new Error(`Response status:${response2.status}`);
        }
        const responseData = (await response2.json()) as Recipe[];
        setNewRecipe(responseData);
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    }
    setIsLoading(true); // or at the top of useEffect()
    loadRecipes();
  }, []);

  console.log(newRecipes);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div>
        Error Loading Recipes:
        {error instanceof Error ? error.message : 'Unknown Error'}
      </div>
    );
  }

  console.log('newRecipes', newRecipes);
  return (
    <div className={isopen === true ? 'bg-img-open' : 'bg-img-close'}>
      <div className="container-new-recipe">
        <div className="row">
          <h1 className="font-recipes">Recipes:</h1>
        </div>
        <div className="row">
          <div className="column-full">
            {newRecipes.map((newRecipe, index) => (
              // div here is parent container and its children: Link, RiDeleteBin6Line icon
              <div key={newRecipe.recipeId} className="d-flex justify-around ">
                <Link
                  to={`/recipes/${newRecipe.recipeId}`}
                  className="menu-link-recipes">
                  <h3 className="h3-recipes">
                    {/* newRecipe.responseTitle here the responseTitle has to match what in the Recipes table
                    where each newRecipes row has a property responseTitle */}
                    {index + 1}. {newRecipe.responseTitle}
                  </h3>
                </Link>
                <RiDeleteBin6Line size={25} className="add-margin-recipes" />
              </div>
            ))}
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
