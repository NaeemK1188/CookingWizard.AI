import { Link } from 'react-router-dom';
import './Recipes.css';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { useEffect, useState } from 'react';
import { type Recipe } from '../App';
import { readToken } from '../data';
import { useUser } from './useUser';

export function Recipes() {
  const [newRecipes, setNewRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState<unknown>();
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useUser();

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
    setIsLoading(true);
    loadRecipes();
  }, [user]);

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

      setNewRecipes(
        newRecipes.filter((recipe) => recipe.recipeId !== recipeId)
      );
    } catch (error) {
      alert('failed to delete');
    } finally {
      setIsDeleting(false);
    }
  }


  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {

    return (
      <>
        {user && (
          <div>
            Error Loading Recipes: you dont have any recipes yet {''}.
            {error instanceof Error ? error.message : 'Unknown Error'}
          </div>
        )}
        {!user && (
          <div>
            Error Loading Recipes: please sign in or sign up {''}.
            {error instanceof Error ? error.message : 'Unknown Error'}
          </div>
        )}
      </>
    );
  }

  return (
    <div className="bg-img-open">
      <div className="container-Recipes">
        <div className="h3-recipes">
          <div className="row">
            <h1 className="font-recipes">Recipes:</h1>
          </div>
          <div className="row">
            <div className="column-full">
              {newRecipes.map((newRecipe, index) => (
                <div
                  key={newRecipe.recipeId}
                  className="d-flex justify-around ">
                  <Link
                    to={`/recipes/${newRecipe.recipeId}`}
                    className="menu-link-recipes">
                    <h3 className="h3-recipes">
                      {index + 1}. {newRecipe.responseTitle}
                    </h3>
                  </Link>
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
    </div>
  );
}
