import { Link } from 'react-router-dom';
import './Recipes.css';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { type OutletContextType } from './NewRecipe';
import { useOutletContext } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { type Recipe } from '../App';
import { readToken } from '../data';

export function Recipes() {
  const { isopen } = useOutletContext<OutletContextType>();
  const [newRecipes, setNewRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState<unknown>();
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadRecipes() {
      try {
        const bear = readToken();
        const request = {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${bear}`,
          },
        };
        const response2 = await fetch('/api/recipes', request);
        if (!response2.ok) {
          throw new Error(`Response status:${response2.status}`);
        }
        const responseData = (await response2.json()) as Recipe[];
        setNewRecipes(responseData);
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    }
    setIsLoading(true); // or at the top of useEffect()
    loadRecipes();
  }, []);

  async function handleDelete(recipeId: number) {
    try {
      const bear = readToken();
      const req = {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bear}`,
        },
      };
      const response = await fetch(`/api/recipes/${recipeId}`, req);
      if (!response.ok) {
        throw new Error(`response status: ${response.status}`);
      }
      // not equal the one i want to delete. keeps everything in the array except the one
      // matches the same recipeId

      setNewRecipes(
        newRecipes.filter((recipe) => recipe.recipeId !== recipeId)
      );
    } catch (error) {
      alert('failed to delete');
    } finally {
      // So the pop up of deleting disappears
      setIsDeleting(false);
    }
  }

  console.log(newRecipes);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div>
        Error Loading Recipes: please sign in or sign up {''}.
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
                {/* we are using arrow function to pass the handleDelete the recipeId that has to be deleted from the recipes list */}
                {/* its only getting deleted when we refresh the page which is deleting from the database. we need to deleted from react
                which is getting deleted without refreshing the page  */}
                {/* testing deleting immediately without a model */}
                <RiDeleteBin6Line
                  size={25}
                  className="add-margin-recipes"
                  onClick={() => setIsDeleting(true)}
                />
                {isDeleting && (
                  <div className="modal-container d-flex justify-center align-center">
                    <div className="modal row">
                      <div className="column-full d-flex justify-center">
                        <p>Are you sure you want to delete this recipe?</p>
                      </div>
                      <div className="column-full d-flex  justify-between">
                        <button
                          className="modal-button clicked-btn"
                          onClick={() => setIsDeleting(false)}>
                          Cancel
                        </button>
                        {/* pass recipeId in newRecipes[index].recipeId */}
                        <button
                          className="modal-button red-background white-text"
                          onClick={() => handleDelete(newRecipe.recipeId)}>
                          Confirm
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
