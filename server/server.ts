/* eslint-disable @typescript-eslint/no-unused-vars -- Remove when used */
import 'dotenv/config';
import express from 'express';
import pg from 'pg';
import { ClientError, errorMiddleware } from './lib/index.js';
import { OpenAI } from 'openai';
import { request } from 'http';

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

// console.log(responseAI.choices[0].message.content);

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
    console.log(req.body);
    console.log(requestIngredient);
    if (!requestIngredient) {
      throw new ClientError(400, 'missing body content');
    }

    // using prompt engineering to get the right response from AI
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

    // extracting the entire response from OpenAI
    const recipeResponse = OpenAIResponse.choices[0].message.content;
    console.log(recipeResponse); // output in server terminal

    // using regex(regular expression language) on a text
    // const title = recipeResponse?.match(/\*\*Recipe Title:\*\*\s(.*?)\\n/);
    // extracting title from the AI response
    const title = recipeResponse?.match(/#\s(.*)/)?.[1]; // using regular expression to get everything after # and stops and first of \n.
    // then we are extracting the second element of the array returned that is the title because ".match" returns the target and the result in one array
    // output is json format
    res.json({ title, recipe: recipeResponse }); // here we can put "title" instead "title:title"
    // output in the third terminal where we are using httpie POST request
  } catch (error) {
    next(error);
  }
});

// ---------------Display resulted recipes on Your Recipes----------------------------
// list all recipes for one user or certain user after logging in and navigate to
// your recipes
// we don't put userId in api end point for security matter. it has to be in auth middleware
// using req.user
app.get('/api/recipes', async (req, res, next) => {
  try {
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
