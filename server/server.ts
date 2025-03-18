/* eslint-disable @typescript-eslint/no-unused-vars -- Remove when used */
import 'dotenv/config';
import express from 'express';
import pg from 'pg';
import { ClientError, errorMiddleware } from './lib/index.js';
import { OpenAI } from 'openai';

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// using API key explicitly old version
// where the client is created directly by instantiating OpenAI object
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// -------------testing OpenAI ---------------------------
// const responseAI = await openai.chat.completions.create({
//   model: "gpt-4o",
//   messages: [
//     {
//       role: "system",
//       content: `Act as a professional cooker, who creates recipes for average people at home
//       from random ingredients they have. Extract for me the title of the recipe and instructions.`
//     },
//     {
//       role: "user",
//       content: `The user enters onion, tomatoes, and potatoes. My user only expects to see the recipe title, ingredients, and
//       and recipe instructions and that is all they need.`
//     }
//   ]
// });

// // console.log(responseAI.choices[0].message.content);
// const recipeResponse = responseAI.choices[0].message.content;
// const target = "Recipe Title" // target string we are looking for
// let titleIndex = -1; // if its not found
// if (recipeResponse)
// {
//   for (let i = 0; i < recipeResponse.length; i++)
//   {
//     // (i, i + target.length) = (10, 10 + 12) = (10, 22) which accommodate the length of target
//     if (recipeResponse.slice(i, i + target.length) === target)
//     {
//       console.log(`${target} is found at index ${i}`); // found at index 2
//       titleIndex = i; // update the title index to be found
//     }
//   }

//   if (titleIndex === -1)
//   {
//     console.log('Recipe Title not found');
//   }
// }
// -------------testing OpenAI ---------------------------

const app = express();

// Create paths for static directories
const reactStaticDir = new URL('../client/dist', import.meta.url).pathname;
const uploadsStaticDir = new URL('public', import.meta.url).pathname;

app.use(express.static(reactStaticDir));
// Static directory for file uploads server/public/
app.use(express.static(uploadsStaticDir));
app.use(express.json());

// test on client side
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

// -------------------Actual application endpoints ------------------------------------

// ------------------Generate recipe using OpenAI-------------------------------------
// we can call the endpoint anything
app.post('/api/new-recipe', async (req, res, next) => {
  try {
    const { requestIngredient } = req.body;
    if (!requestIngredient) {
      throw new ClientError(400, 'missing body content');
    }

    const systemPrompt = `Act as a professional cooker, who creates recipes for average people at home
       from random ingredients they have. Extract for me the title of the recipe and instructions.
       Return the response as markdown with the title as the header, followed by Ingredients, and Instructions in sub-headers.`;
    const UserPrompt = `The user enters the following ingredient: ${requestIngredient}.
    My user only expects to see the recipe title, ingredients, and
      and recipe instructions and that is all they need.`;

    const OpenAIResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: UserPrompt,
        },
      ],
    });

    // // extracting the result into JSON formate
    // // res.json({recipeTitle:OpenAIResponse.choices[0].message.content});
    const recipeResponse = OpenAIResponse.choices[0].message.content;
    console.log(recipeResponse);
    // const recipeResponse =
    // '**Recipe Title:** Rustic Tomato, Onion, and Potato Bake\n\n**Ingredients:**\n- 1 medium onion\n- 3 medium tomatoes\n- 3 medium potatoes\n- 2 tablespoons olive oil\n- Salt and pepper to taste\n- 1 teaspoon dried oregano (optional)\n- 1 teaspoon garlic powder (optional)\n- Grated Parmesan cheese (optional for garnish)\n\n**Instructions:**\n\n1. **Preheat the Oven:** Preheat your oven to 400°F (200°C).\n\n2. **Prepare the Ingredients:** \n    - Peel the onion and slice it into thin rounds.\n    - Wash the tomatoes and potatoes thoroughly. Slice the tomatoes and potatoes into thin rounds as well.\n\n3. **Layer the Vegetables:**\n    - In a baking dish, begin layering by placing a layer of potato slices on the bottom, slightly overlapping them.\n    - Add a layer of onion slices over the potatoes, followed by a layer of tomato slices.\n    - Repeat the layering process until all the vegetables are used, finishing with a layer of tomatoes on top.\n\n4. **Season the Dish:**\n    - Drizzle the olive oil evenly over the layered vegetables.\n    - Sprinkle salt, pepper, dried oregano, and garlic powder (if using) over the top layer.\n\n5. **Bake the Dish:**\n    - Cover the baking dish with aluminum foil and place it in the preheated oven.\n    - Bake for approximately 40-45 minutes, or until the potatoes are tender when poked with a fork.\n\n6. **Finish and Serve:**\n    - Remove the foil and bake for an additional 10-15 minutes until the top layer is slightly crispy.\n    - If desired, sprinkle grated Parmesan cheese over the top for added flavor.\n    - Allow the dish to cool slightly before serving.\n\nEnjoy your rustic tomato, onion, and potato bake as a comforting main or side dish!';
    // const title = recipeResponse?.match(/\*\*Recipe Title:\*\*\s(.*?)\\n/);
    const title = recipeResponse?.match(/#\s(.*)/)?.[1];
    res.json({ title, recipe: recipeResponse });
    // const target = "Recipe";
    // const titleIndex = -1;
    // if (recipeResponse)
    // {
    //   for (let i = 0; i <= recipeResponse.length - target.length; i++)
    //   {
    //     if (recipeResponse.slice(i, i + target.length) === target)
    //     {
    //       console.log("**Recipe Title: is found");
    //     }

    //   }
    //   if (titleIndex === -1)
    //   {
    //     console.log("not found");
    //   }
    // }
  } catch (error) {
    next(error);
  }
});

// ---------------Display resulted recipes on Your Recipes----------------------------
// list all recipes for one user or certain user after logging in and navigate to
// your recipes
// we dont put userId in api end point for security matter. it has to be in auth middleware
// using req.user
app.get('/api/recipes', async (req, res, next) => {
  try {
    // const {userId} = req.user?.userId;
    // the error of user not exists, is not being caught ?
    // if(!userId || !Number.isInteger(+userId)) // if request is missing userId
    // {
    //   throw new ClientError(400, "No user Id was provided or the id provided is not an integer");
    // }
    const sql = `select * from "Recipes"
                where "userId" = $1;`;
    // after getting the response from the query
    // res.user is an auth middleware object after signing in
    // we need to fix it since req.user?.userId not exists yet because no signing yet
    // if req.user?.userId is undefined, then outout row where userId = 1
    const params = [req.user?.userId ?? 3]; // always query for userId 1 or use 2
    // with the end point '/api/recipes', which outputs all recipes for userId 1 or 2
    // if we use [req.user?.userId ?? 3], it will output ClientError(404, 'No recipes are available')
    // // or
    // const params = [!req.user?.userId && 2];
    // or
    // const params = [req.user?.userId ? "" : 1];
    const result = await db.query(sql, params);
    const recipes = result.rows;
    // if the recipes array of object recipe is empty
    if (!recipes.length) {
      // if recipes do not exist for certain user
      throw new ClientError(404, 'No recipes are available');
    }

    res.json(recipes);
  } catch (error) {
    next(error);
  }
});

// ---------------Display resulted recipes on Your Recipes----------------------------

// -------------- Display certain recipe's details in side window or in your recipes  ----------------------------------
// following REST api. So, instead of /details/:recipeId, we use recipes/:recipeId
app.get('/api/recipes/:recipeId', async (req, res, next) => {
  try {
    const { recipeId } = req.params;
    if (!recipeId) {
      throw new ClientError(400, 'Please recipe ID');
    }
    // add more filtering to select exactly one entry from two by using recipeId.
    const sql = `select * from "Recipes"
                 where "recipeId" = $1 and "userId" = $2 `;
    const params = [recipeId, req.user?.userId ?? 2]; // req.user?.userId ?? 1 for userId
    // always query for userId 1 or use 2 with /api/recipes/3, it will output recipeId 3 for userId 2
    // if [recipeId, req.user?.userId ?? 2] and http localhost:8080/api/recipes/2, it will output
    // only recipeId 2 for userId 2 not all recipes
    const result = await db.query(sql, params);
    const recipe = result.rows[0];
    if (!recipe.length) {
      throw new ClientError(404, 'recipe does not exist');
    }

    res.json(recipe);
  } catch (error) {
    next(error);
  }
});

// -------------- Display certain recipe's details in side window or in your recipes  ----------------------------------

// --------------Saving generated recipe -------------------------------------------
app.post('/api/recipes', async (req, res, next) => {
  try {
    // we don't need to include userId for security reasons, and it should come from
    // from authMiddleware using req.user?.userId
    const { responseTitle, requestIngredient, responseInstruction } = req.body;
    if (!responseTitle || !requestIngredient || !responseInstruction) {
      throw new ClientError(400, "Missing request's body");
    }
    const sql = `insert into "Recipes" ("responseTitle", "requestIngredient", "responseInstruction", "userId")
                 values ($1, $2, $3, $4)
                 returning *`;
    // req.user?.userId or .user?.userId comes from authMiddleware
    const params = [
      responseTitle,
      requestIngredient,
      responseInstruction,
      req.user?.userId ?? 2,
    ]; // adding new recipe for userId = 2
    const result = await db.query(sql, params);
    const newRecipe = result.rows[0];
    if (!newRecipe) {
      // handling error when no response gets back after the query
      throw new ClientError(404, 'No entries are available');
    }
    res.json(newRecipe);
  } catch (error) {
    next(error);
  }
});

// --------------Saving generated recipe -------------------------------------------

// ---------------Deleting recipe ------------------------------------------------

app.delete('/api/recipes/:recipeId', async (req, res, next) => {
  try {
    const { recipeId } = req.params;
    if (!recipeId) {
      throw new ClientError(400, 'recipe ID does not exist');
    }

    const sql = `delete from "Recipes"
                 where "recipeId" = $1 and "userId" = $2
                 returning *;`;
    const params = [recipeId, req.user?.userId ?? 2];
    const result = await db.query(sql, params);
    const removedRecipe = result.rows[0];
    if (!removedRecipe) {
      throw new ClientError(404, 'No recipes are available');
    }
    res.json(removedRecipe);
  } catch (error) {
    next(error);
  }
});

// ---------------Deleting recipe ------------------------------------------------

/*
 * Handles paths that aren't handled by any other route handler.
 * It responds with `index.html` to support page refreshes with React Router.
 * This must be the _last_ route, just before errorMiddleware.
 */
app.get('*', (req, res) => res.sendFile(`${reactStaticDir}/index.html`));

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  console.log('Listening on port', process.env.PORT);
});
