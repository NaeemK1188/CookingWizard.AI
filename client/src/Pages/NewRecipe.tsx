import './NewRecipe.css';
import { useState } from 'react';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { GiCampCookingPot } from 'react-icons/gi';
import { TfiSave } from 'react-icons/tfi';
import { type Recipe } from '../App';
import Markdown from 'react-markdown';
import { useOutletContext } from 'react-router-dom';
import { readToken } from '../data';

// we need to use the prop key that its value is the state

// receiving the state setter set_Recent_Recipes from AppDrawer to
// update the recentRecipe state in AppDrawer
export type OutletContextType = {
  isopen: boolean;
  set_Recent_Recipes: (recipe: Recipe) => void;
  // using  (recipe: Recipe) because we are expecting to send back recipe
  // if we use only "() =>" and we are doing set_Recent_Recipes(recipe: Recipe),
  // react will give us error, expecting nothing and you are passing one argument
};

export function NewRecipe() {
  const { isopen, set_Recent_Recipes } = useOutletContext<OutletContextType>();
  const [requestIngredient, setRequestIngredient] = useState('');
  const [responseRecipe, setResponseRecipe] = useState<Recipe | null>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  // const [error, setError] = useState<unknown>();
  let recipeText;

  async function handleSubmit() {
    setIsLoading(true);
    try {
      // readToken is to make sure that if the user is already signed in and it will
      // be used in every fetch call
      const bear = readToken();
      const request = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${bear}`,
        },
        // the body has to have the same name like the body in server body server.ts
        body: JSON.stringify({ requestIngredient }),
      };

      const response = await fetch('/api/new-recipe', request);

      if (!response.ok) {
        throw new Error(`fetch ERROR ${response.status}`);
      }
      const recipe = (await response.json()) as Recipe; // we are receiving an object back from the server(recipe,title)
      setResponseRecipe(recipe); // updating the recipe's object
      set_Recent_Recipes(recipe); // telling parent AppDrawer about new recipe
      // Now AppDrawer knows about the new recipe and display it on screen in jsx
      // we can pass the data up to parent by using state setter functions
    } catch (error) {
      alert(error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleClear() {
    // not mutate state only its key
    // setResponseRecipe({recipe:"", title:""});
    // takes null now because we added to the state null
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
        // not we are storing the value of the properties in a variable so requestIngredient is like
        // requestIngredient: "Bananas and milk"
        body: JSON.stringify({
          responseTitle: responseRecipe?.title,
          requestIngredient,
          responseInstruction: responseRecipe?.recipe,
        }),
      };

      // to see what im sending
      console.log('sending', {
        responseTitle: responseRecipe?.responseTitle,
        requestIngredient,
        responseInstruction: responseRecipe?.responseInstruction,
      });
      const response1 = await fetch('/api/recipes', request1);

      if (!response1.ok) {
        throw new Error(`fetch ERROR ${response1.status}`);
      }
    } catch (error) {
      alert(error);
    } finally {
      setIsSaved(true);
      // alert('New Recipe has been added');
    }
  }

  if (isLoading) {
    recipeText = <div>Generating Recipe...</div>;
  } else if (responseRecipe) {
    recipeText = <Markdown>{responseRecipe.recipe}</Markdown>;
  } else if (!isLoading && !responseRecipe) {
    recipeText = (
      <p className="font-color">
        Welcome to Cooking wizard AI. Enter ingredients below.....
      </p>
    );
  }

  // if (isopen === true)
  // {
  //   toggleBg = 'bg-img-open ';
  // }

  // else if (isopen === false)
  // {
  //   toggleBg = 'bg-img-close';
  // }

  return (
    <div className={isopen === true ? 'bg-img-open' : 'bg-img-close'}>
      {/* <div className="bg-img-close"> */}
      <div className="container-new-recipe">
        <div className="d-flex flex-dir ">
          <div className="row">
            <div className="column-full">
              {/* { !isLoading && <p className="font-color">
                {responseRecipe?.recipe ?? "Welcome to Cooking wizard AI. Enter ingredients below....."}
              </p>}
                 {isLoading && <div>Loading...</div>} */}
              {isSaved && (
                <textarea
                  placeholder="New Recipe has been added"
                  className="popup"
                />
              )}
              {/* recipeText is showing the response or isLoading or the default text */}
              {recipeText}
            </div>
          </div>
          <div>
            <div className="row">
              {/*  column-full is acting as a container*/}
              <div className="column-full sticky-bottom">
                {/* textarea is acting as a row */}
                <div>
                  {/* the value property is from what user enter in the textarea */}
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
                {/* div is acting as a row and has 4 columns icons */}
                <div>
                  <GiCampCookingPot
                    // className="add-margin"
                    onClick={handleSubmit}
                  />
                  <RiDeleteBin6Line
                    // className="add-margin"
                    onClick={handleClear}
                  />
                  <TfiSave
                    //  className="add-margin"
                    onClick={handleSave}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------------testing API with AI Response fetch call ----------------------------------------

// import { useState } from 'react';

// const [requestIngredient, setRequestIngredient] = useState('');
// const [responseRecipe, setResponseRecipe] = useState<Recipe>(); // we made the responseRecipe as an object Recipe
// // because the endpoint /api/new-recipe endpoint is sending
// // res.json({ title, recipe: recipeResponse }) which is an object Recipe or its sending an object

// async function handleSubmit() {
//   const request = {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ requestIngredient }), // the body we are sending is an object that has an
//     // requestIngredient prop has the value string that are the ingredients types in from the user
//     // or the req.body from the request body from server.ts const { requestIngredient } = req.body;
//   };

//   const response = await fetch('/api/new-recipe', request);
//   if (!response.ok) {
//     throw new Error(`fetch Error ${response.status}`);
//   }

//   const recipe = (await response.json()) as Recipe;
//   setResponseRecipe(recipe);
// }
// // async function readServerData()
// // {
// //   // const resp = await fetch('/api/hello'); testing api from
// //   // nothing to fetch because no inserted data
// //   const resp = await fetch('/api/new-recipe');
// //   const data = await resp.json();

// //   console.log('Data from server:', data);

// //   setServerData(data);
// // }

// return (
//   <>
//     {/* when we made the onChange here, its like letting the
//       to type, But AI is only returning the whole answer all together not typing
//       so we only use the state directly like  {responseRecipe?.recipe} */}
//     <div className="container-response">
//       {/* nothing on screen because server error */}
//       {/* onchange only when user types */}
//       {/* <textarea
//           name="response"
//           cols={70}
//           rows={50}
//           value={responseRecipe}
//           // handles change of input on screen
//           onChange={(event) => setResponseRecipe(event.target.value)}
//         /> */}
//       {responseRecipe?.recipe}
//     </div>
//     {/* the input and textarea are to let the user input
//       we are using onChange because we are letting the user type in*/}
//     <div className="container-request">
//       <textarea
//         name="request"
//         cols={70}
//         rows={6}
//         value={requestIngredient}
//         onChange={(event) => setRequestIngredient(event.target.value)}
//       />
//     </div>
//     <button className="border-width" onClick={handleSubmit}>
//       New Recipe
//     </button>
//     {/* <h1>{serverData}</h1> */}
//   </>
// );
// ------------------------testing API with AI Response fetch call ----------------------------------------
