import './NewRecipe.css';
import { useEffect, useState } from 'react';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { GiCampCookingPot } from 'react-icons/gi';
import { TfiSave } from 'react-icons/tfi';
import { type Recipe } from '../App';
import Markdown from 'react-markdown';
import { useOutletContext } from 'react-router-dom';
import { readToken } from '../data';

export type OutletContextType = {
  set_Recent_Recipes: (recipe: Recipe) => void;
  set_Response_Recipe: (recipe: Recipe) => void;
};

export function NewRecipe() {
  const { set_Recent_Recipes } = useOutletContext<OutletContextType>();
  const [requestIngredient, setRequestIngredient] = useState('');
  const [responseRecipe, setResponseRecipe] = useState<Recipe | null>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  let recipeText;

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth <= 480) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    }

    window.addEventListener('resize', handleResize);

    if (window.innerWidth <= 480) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  async function handleSubmit() {
    setIsLoading(true);
    setResponseRecipe(null);
    try {
      const bear = readToken();
      const request = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bear}`,
        },
        body: JSON.stringify({ requestIngredient }),
      };

      const response = await fetch('/api/new-recipe', request);

      if (!response.ok) {
        throw new Error(`fetch ERROR ${response.status}`);
      }
      const recipe = (await response.json()) as Recipe; // we are receiving an object with properties
      setResponseRecipe(recipe);
      set_Recent_Recipes(recipe);
    } catch (error) {
      alert(error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleClear() {
    setResponseRecipe(null);
    setRequestIngredient('');
    setIsSaved(false);
  }

  async function handleSave() {
    setIsSaved(false);
    try {
      const bear = readToken();
      const request1 = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bear}`,
        },

        body: JSON.stringify({
          responseTitle: responseRecipe?.title,
          requestIngredient,
          responseInstruction: responseRecipe?.recipe,
          imgURL: responseRecipe?.imgURL,
        }),
      };

      const response1 = await fetch('/api/recipes', request1);

      if (!response1.ok) {
        throw new Error(`fetch ERROR ${response1.status}`);
      }
      setIsSaved(true);
    } catch (error) {
      alert(error);
    }
  }

  if (isLoading) {
    recipeText = <div className="align-text">Generating Recipe...</div>;
  } else if (responseRecipe) {
    recipeText = <Markdown>{responseRecipe.recipe}</Markdown>;
  } else if (!isLoading && !responseRecipe) {
    recipeText = (
      <p className="font-color align-text">
        Welcome to Cooking wizard AI. Enter ingredients below.....
      </p>
    );
  }

  return (
    <>
      {!isMobile && (
        <div className="bg-img-open">
          <div className="container-new-recipe">
            <div className="d-flex flex-dir margin-top-new-recipe ">
              <div className="row">
                {isSaved && (
                  <textarea
                    placeholder="New Recipe has been added"
                    className="popup"
                  />
                )}
                {!responseRecipe ? (
                  <div className="column-full">{recipeText} </div>
                ) : (
                  <div className="column-half">{recipeText}</div>
                )}
                <div className="column-half">
                  {responseRecipe && (
                    <img
                      className="img-recipe"
                      src={responseRecipe?.imgURL}
                      alt="recipe image"
                      style={{ borderRadius: '10px' }}
                    />
                  )}
                </div>
              </div>
              <div>
                <div className="row">
                  <div className="column-full align-text">
                    <div>
                      <textarea
                        name="request"
                        cols={70}
                        rows={6}
                        placeholder="what do you have in pantry ?"
                        className="request-container"
                        value={requestIngredient}
                        onChange={(event) =>
                          setRequestIngredient(event.target.value)
                        }
                      />
                    </div>
                    <div>
                      <GiCampCookingPot
                        className="add-margin-new-recipe"
                        onClick={handleSubmit}
                      />
                      <RiDeleteBin6Line
                        className="add-margin-new-recipe"
                        onClick={handleClear}
                      />
                      <TfiSave
                        className="add-margin-new-recipe"
                        onClick={handleSave}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {isMobile && (
        <div className="phone-bg-image">
          <div
            className={
              responseRecipe ? 'phone-container add-bg' : 'phone-margin-top'
            }>
            <div>
              <div className="phone-row">
                {isSaved && (
                  <textarea
                    placeholder="New Recipe has been added"
                    className="popup"
                  />
                )}
                {!responseRecipe ? (
                  <div className="phone-col-full">{recipeText} </div>
                ) : (
                  <div className="phone-col-half">{recipeText}</div>
                )}
                <div className="phone-col-half">
                  {responseRecipe && (
                    <img
                      className="phone-img-recipe"
                      src={responseRecipe?.imgURL}
                      alt="recipe image"
                      style={{ borderRadius: '10px' }}
                    />
                  )}
                </div>
              </div>
              <div>
                <div className="phone-row">
                  <div className="phone-col-full align-text">
                    <div>
                      <textarea
                        name="request"
                        cols={45}
                        rows={6}
                        placeholder="what do you have in pantry ?"
                        className="request-container"
                        value={requestIngredient}
                        onChange={(event) =>
                          setRequestIngredient(event.target.value)
                        }
                      />
                    </div>
                    <div>
                      <GiCampCookingPot
                        className="add-margin-new-recipe"
                        onClick={handleSubmit}
                        size={'30px'}
                      />
                      <RiDeleteBin6Line
                        className="add-margin-new-recipe"
                        onClick={handleClear}
                        size={'30px'}
                      />
                      <TfiSave
                        className="add-margin-new-recipe"
                        onClick={handleSave}
                        size={'27px'}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
