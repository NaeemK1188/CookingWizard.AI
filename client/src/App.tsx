import './App.css';
import { Routes, Route } from 'react-router-dom';
import { AppDrawer } from './components/AppDrawer';
import { HomePage } from './Pages/HomePage';
import { NewRecipe } from './Pages/NewRecipe';
import { Recipes } from './Pages/Recipes';
import { RecipeDetails } from './Pages/RecipeDetails';

// title, recipe are from the response from the /api/new-recipe
// because server.ts at /api/new-recipe endpoint, its sending
// res.json({ title, recipe: recipeResponse }) an object Recipe
export type Recipe = {
  title: string;
  recipe: string;
};

export default function App() {
  // both wil be changing on display and constantly changing, so there states are changing
  return (
    // routes don't need to be in order

    <Routes>
      {/* the header side window or can be at the top that will be always in the home page at "/"
      and every page */}
      <Route path="/" element={<AppDrawer />}>
        {/* home page at "/" */}
        <Route index element={<HomePage />} />
        <Route path="new-recipe" element={<NewRecipe />} />
        <Route path="recipes" element={<Recipes />} />
        <Route path="recipes/:recipeId" element={<RecipeDetails />} />
      </Route>
    </Routes>
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
