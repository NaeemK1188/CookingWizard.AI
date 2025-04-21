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
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useUser();

  // as soon as my components mount or load first mount want to check screen size, and then update the state
  // or run the code. So it renders all the contents without waiting for a click. It renders all products or items on the page without
  // waiting for a click
  // to run asynchronous code we use useEffect or event like onClick for eventlistener for the rect way
  // it happens as soon as the contents loads on screen. It doesn't not wait for any events like click
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth <= 480) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    }

    // Add event listener
    // not waiting for a click or things we dont have control of which is the window
    // we usually add event listener with window not inside the jsx
    // here, we trigger an event without a click and calling the function handleResize
    window.addEventListener('resize', handleResize);

    // necessary statement because when we change to desktop screen,
    // it shows the recipeDetails in desktop not the mobile again
    if (window.innerWidth < 480) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }

    // Cleanup on unmount
    // still works without the cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
    // or if its still 480px, we remove the event listener
    // is the if statement correct or equivalent to return statement
    // if (window.innerWidth === 480)
    // {
    //   window.removeEventListener('resize', handleResize);
    // }
  }, []);

  // we always use useEffect when we GET request or getting data from backend
  // we just add the content on screen without any click or event as soon as the contents load on screen
  useEffect(() => {
    // we don't have to use recipeId: number because it can access the top
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
  // const instructionPages = responseInstruction.split(/\n\s*\n/); // split by empty lines
  // this is like recipeDetail.responseInstruction
  // <div className={isopen === true ? 'bg-img-open' : 'bg-img-close'}>
  // creating a component or different structure for the phone
  // here its for desktop
  // here the jsx first checks if its mobile or desktop, without any click event
  // by using useEffect at the top where it runs as soon as contents of the application
  // mount or load on screen
  // note , for both conditions, i need to make the structure exactly the same, or
  // use different classes' names completely for everything in css for mobile, or i will get render loop
  // and weird behavior causing flickering and mixed view between desktop and mobile on every click in my code
  // or even adding a space, or switching between views
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
                  {/* we cannot use images here because the image is not saved in database to be fetched */}
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
      {/* here component for phone with different structure do the same thing for new-recipe */}
      {isMobile && (
        <div className="phone-menu-drawer">
          <div className="phone-container">
            {recipeDetail.userId === user?.userId && (
              <>
                <h1 className="phone-font-recipes">Recipes:</h1>
                <div className="phone-row">
                  <div className="phone-col-half">
                    <Markdown>{responseInstruction}</Markdown>
                  </div>
                  {/* we cannot use images here because the image is not saved in database to be fetched */}
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
