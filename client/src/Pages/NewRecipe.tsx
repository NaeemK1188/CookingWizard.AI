import './NewRecipe.css';
import { useState } from 'react';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { GiCampCookingPot } from 'react-icons/gi';
import { TfiSave } from 'react-icons/tfi';
import { type Recipe } from '../App';
import Markdown from 'react-markdown';

export function NewRecipe() {
  const [requestIngredient, setRequestIngredient] = useState('');
  const [responseRecipe, setResponseRecipe] = useState<Recipe>();
  const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState<unknown>();

  async function handleSubmit() {
    setIsLoading(true);
    try {
      const request = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // the body has to have the same name like the body in server body server.ts
        body: JSON.stringify({ requestIngredient }),
      };

      const response = await fetch('/api/new-recipe', request);

      if (!response.ok) {
        throw new Error(`fetch ERROR ${response.status}`);
      }
      const recipe = (await response.json()) as Recipe;
      setResponseRecipe(recipe);
    } catch (error) {
      alert(error);
    } finally {
      setIsLoading(false);
    }
  }

  let recipeText;

  if (isLoading) {
    recipeText = <div>Loading...</div>;
  } else if (responseRecipe) {
    recipeText = <Markdown>{responseRecipe.recipe}</Markdown>;
  } else {
    recipeText = (
      <p className="font-color">
        Welcome to Cooking wizard AI. Enter ingredients below.....
      </p>
    );
  }

  return (
    <div className="bg-img">
      <div className="container-new-recipe">
        <div className="d-flex flex-dir ">
          <div className="row">
            <div className="column-full">
              {/* { !isLoading && <p className="font-color">
                {responseRecipe?.recipe ?? "Welcome to Cooking wizard AI. Enter ingredients below....."}


              </p>}
                 {isLoading && <div>Loading...</div>} */}
              {recipeText}
            </div>
          </div>
          <div>
            <div className="row">
              {/*  column-full is acting as a container*/}
              <div className="column-full">
                {/* textarea is acting as a row */}
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
                {/* div is acting as a row and has 4 columns icons */}
                <div>
                  <GiCampCookingPot
                    className="add-margin"
                    onClick={handleSubmit}
                  />
                  <RiDeleteBin6Line className="add-margin" />
                  <TfiSave className="add-margin" />
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
