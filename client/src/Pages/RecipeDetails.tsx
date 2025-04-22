import { useParams } from 'react-router-dom';
import './RecipeDetails.css';
import { type Recipe } from '../App';
import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import { readToken } from '../data';
import { useUser } from './useUser';



export function RecipeDetails() {
  const { recipeId } = useParams();
  const [recipeDetail, setrecipeDetail] = useState<Recipe>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>();
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth <= 480) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    }

    window.addEventListener('resize', handleResize);

    if (window.innerWidth < 480) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
    };

  }, []);

  useEffect(() => {
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
      setIsLoading(true);
      loadRecipe();
    }
  }, [recipeId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
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

  return (
    <>
      {!isMobile && (
        <div className="bg-img-open">
          <div className="container-new-recipe margin-left-top-Details">
            {recipeDetail.userId === user?.userId && (
              <>
                <h1 className="font-recipes">Recipes:</h1>
                <div className="row">
                  <div className="column-half">
                    <Markdown>{responseInstruction}</Markdown>
                  </div>
                  <div className="column-half">
                    <img
                      className="img-recipe"
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
      )}
      {isMobile && (
        <div className="phone-menu-drawer">
          <div className="phone-container add-bg">
            {recipeDetail.userId === user?.userId && (
              <>
                <h1 className="phone-font-recipes">Recipes:</h1>
                <div className="phone-row">
                  <div className="phone-col-half">
                    <Markdown>{responseInstruction}</Markdown>
                  </div>
                  <div className="phone-col-half">
                    <img
                      className="phone-img-recipe"
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
      )}
    </>
  );
}
