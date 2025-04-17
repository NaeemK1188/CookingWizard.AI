import { useParams } from 'react-router-dom';
import './RecipeDetails.css';
// import { useOutletContext } from 'react-router-dom';
// import { type OutletContextType } from './NewRecipe';
import { type Recipe } from '../App';
import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import { readToken } from '../data';
import { useUser } from './useUser';

// type OutletContextType = {
//   recent_recipe: Recipe;
// };

export function RecipeDetails() {
  const { recipeId } = useParams();
  // const { recent_recipe } = useOutletContext<OutletContextType>();
  // using this state because the details are changing on the screen
  const [recipeDetail, setrecipeDetail] = useState<Recipe>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>();
  const { user } = useUser();

  // we always use useEffect when we GET request or getting data from backend
  useEffect(() => {
    // we dont have to use recipeId: number because it can access the top
    // {RecipeId} = useParams()
    async function loadRecipe() {
      try {
        const bear = readToken();
        const request = {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${bear}`,
          },
        };

        const response3 = await fetch(`/api/recipes/${recipeId}`, request);
        if (!response3.ok) {
          throw new Error(`Response status:${response3.status}`);
        }
        const responseData = (await response3.json()) as Recipe;
        setrecipeDetail(responseData);
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    }

    if (recipeId) {
      // if RecipeId exist
      setIsLoading(true);
      loadRecipe();
    }
  }, [recipeId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // we need to use return() to display on screen
  if (error) {
    // here display (Error Loading Recipe) or return ()
    return (
      <div>
        Error Loading Recipe {recipeId}:
        {error instanceof Error ? error.message : 'Unknown Error '}
      </div>
    );
  }

  if (!recipeDetail) {
    return null;
  }

  const { responseInstruction, imgURL } = recipeDetail;
  // this is like recipeDetail.responseInstruction
  return (
    // <div className={isopen === true ? 'bg-img-open' : 'bg-img-close'}>
    <div className="bg-img-open">
      <div className="container-new-recipe margin-left-top-Details">
        {recipeDetail.userId === user?.userId && (
          <>
            <h1 className="font-recipes">Recipes:</h1>
            <div className="row">
              <div className="column-half">
                <Markdown>{responseInstruction}</Markdown>
              </div>
              {/* we cannot use images here because the image is not saved in database to be fetched */}
              <div className="column-half">
                <img
                  src={imgURL}
                  alt="recipe image"
                  style={{ borderRadius: '15px' }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
