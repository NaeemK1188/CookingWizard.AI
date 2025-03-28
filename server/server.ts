/* eslint-disable @typescript-eslint/no-unused-vars -- Remove when used */
import 'dotenv/config';
import express from 'express';
import pg from 'pg';
import { authMiddleware, ClientError, errorMiddleware } from './lib/index.js';
import { OpenAI } from 'openai';
import { request } from 'http';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

const hashKey = process.env.TOKEN_SECRET;
if (!hashKey) {
  throw new Error('TOKEN_SECRET not found in .env');
}

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// using API key explicitly old version
// where the client is created directly by instantiating OpenAI object
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();

// Create paths for static directories
const reactStaticDir = new URL('../client/dist', import.meta.url).pathname;
const uploadsStaticDir = new URL('public', import.meta.url).pathname;

app.use(express.static(reactStaticDir));
// Static directory for file uploads server/public/
app.use(express.static(uploadsStaticDir));
app.use(express.json());

// -------------------Actual application endpoints ------------------------------------

// ------------------Generate recipe using OpenAI-------------------------------------

app.post('/api/auth/sign-up', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      throw new ClientError(
        400,
        'username or password is missing from the body request'
      );
    }

    const hashedPassword = await argon2.hash(password);
    const sql = `insert into "Users" ("username", "hashedPassword")
                values ($1, $2)
                returning "userId", "username", "createdAt";`;
    // returning will be shown in the response object in client side after POST fetch request
    const params = [username, hashedPassword];
    const result = await db.query(sql, params);
    const newUser = result.rows[0];
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/sign-in', async (req, res, next) => {
  try {
    // or using const { username, password } = req.body as Partial<Auth>;
    // partial makes fields of <Auth> object optional
    // Auth object contains username and password as string type
    const { username, password } = req.body;
    if (!username || !password) {
      throw new ClientError(
        400,
        'username or password is missing from the body request'
      );
    }

    // we need to select username too in order to display it in the response json
    const sql = `select "userId", "username", "hashedPassword"
                 from "Users"
                 where "username" = $1;`; // sql query selected "userId", "username", and "hashedPassword"
    const params = [username]; // because we only have one param that is [username]
    const result = await db.query(sql, params);
    const user = result.rows[0];
    if (!user) {
      throw new ClientError(401, 'invalid login information');
    }
    const isPassValid = await argon2.verify(user.hashedPassword, password);
    if (!isPassValid) {
      throw new ClientError(401, 'invalid login password');
    }

    if (isPassValid) {
      const payload = { userId: user.userId, username: user.username };

      const token = jwt.sign(payload, hashKey); // creating a token to us after sign in
      res.status(200).json({ user: payload, token }); // token:token
      // on client side we will be getting user and token as a response
      // so we need to create an object in the back end to access the values from server
    }
  } catch (error) {
    next(error);
  }
});

// we can call the endpoint anything
app.post('/api/new-recipe', authMiddleware, async (req, res, next) => {
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
        { role: 'system', content: systemPrompt },
        { role: 'user', content: UserPrompt },
      ],
    });

    // extracting the entire response from OpenAI
    const recipeResponse = OpenAIResponse.choices[0].message.content;
    console.log(recipeResponse); // output in server terminal

    // using regex(regular expression language) on a text
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
app.get('/api/recipes', authMiddleware, async (req, res, next) => {
  try {
    const sql = `select * from "Recipes"
                where "userId" = $1;`;
    // after getting the response from the query
    // res.user is an auth middleware object after signing in
    // we need to fix it since req.user?.userId not exists yet because no signing yet
    // if req.user?.userId is undefined, then output row where userId = 1

    // testing users when we don't have signup/sign in ready
    // [req.user?.userId ?? 1]; always query for userId 1 or use 2

    // with the end point '/api/recipes', which outputs all recipes for userId 1 or 2
    // if we use [req.user?.userId ?? 3], it will output ClientError(404, 'No recipes are available')
    const params = [req.user?.userId];
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
app.get('/api/recipes/:recipeId', authMiddleware, async (req, res, next) => {
  try {
    const { recipeId } = req.params;
    if (!recipeId) {
      throw new ClientError(400, 'Please recipe ID');
    }
    // add more filtering to select exactly one entry from two by using recipeId.
    const sql = `select * from "Recipes"
                 where "recipeId" = $1 and "userId" = $2 `;
    // testing users when we don't have signup/sign in ready
    // always query for userId 1 or use 2 with /api/recipes/3, it will output recipeId 3 for userId 2
    // if [recipeId, req.user?.userId ?? 2] and http localhost:8080/api/recipes/2, it will output
    // only recipeId 2 for userId 2 not all recipes
    const params = [recipeId, req.user?.userId];
    const result = await db.query(sql, params);
    const recipe = result.rows[0];
    if (!recipe) {
      throw new ClientError(404, `recipeId:${recipeId} NOT FOUND`);
    }

    res.json(recipe);
  } catch (error) {
    next(error);
  }
});

// -------------- Display certain recipe's details in side window or in your recipes  ----------------------------------

// --------------Saving generated recipe -------------------------------------------
app.post('/api/recipes', authMiddleware, async (req, res, next) => {
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

    // testing users when we don't have sign in sign up ready
    // [responseTitle, requestIngredient, responseInstruction, req.user?.userId ?? 1]; // adding new recipe for userId = 1

    const params = [
      responseTitle,
      requestIngredient,
      responseInstruction,
      req.user?.userId,
    ];
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

app.delete('/api/recipes/:recipeId', authMiddleware, async (req, res, next) => {
  try {
    const { recipeId } = req.params;
    if (!recipeId) {
      throw new ClientError(400, 'recipe ID does not exist');
    }

    const sql = `delete from "Recipes"
                 where "recipeId" = $1 and "userId" = $2
                 returning *;`;
    // testing users when we don't have sign in sign up ready
    // [recipeId, req.user?.userId ?? 1];

    const params = [recipeId, req.user?.userId];
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
