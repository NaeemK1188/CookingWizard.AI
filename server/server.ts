/* eslint-disable @typescript-eslint/no-unused-vars -- Remove when used */
import 'dotenv/config';
import express from 'express';
import pg from 'pg';
import { authMiddleware, ClientError, errorMiddleware } from './lib/index.js';
import { OpenAI } from 'openai';
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

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();

const reactStaticDir = new URL('../client/dist', import.meta.url).pathname;
const uploadsStaticDir = new URL('public', import.meta.url).pathname;

app.use(express.static(reactStaticDir));
app.use(express.static(uploadsStaticDir));
app.use(express.json({ limit: '5mb' }));
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
    const { username, password, guest } = req.body;
    if (!username || !password) {
      throw new ClientError(
        400,
        'username or password is missing from the body request'
      );
    }
    const sql = `select "userId", "username", "hashedPassword"
                 from "Users"
                 where "username" = $1;`;
    const params = [username];
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
      const payload = {
        userId: user.userId,
        username: user.username,
      };

      if (user.username === 'guest') {
        const deleteSql = `delete from "Recipes"
                          where "userId" = $1`;
        const params = [user.userId];
        await db.query(deleteSql, params);
      }
      const token = jwt.sign(payload, hashKey);
      res.status(200).json({ user: payload, token });
    }
  } catch (error) {
    next(error);
  }
});


app.post('/api/new-recipe', authMiddleware, async (req, res, next) => {
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
        { role: 'system', content: systemPrompt },
        { role: 'user', content: UserPrompt },
      ],
    });

    const OpenAIResponse1 = await openai.images.generate({
      prompt: `A professional dish of ${requestIngredient} on plate, styled
      for a cooking blog contained within the size of 512x512 image dimension`,
      n: 1,
      size: '512x512',
      response_format: 'b64_json',
    });

    const recipeResponse = OpenAIResponse.choices[0].message.content;
    const title = recipeResponse?.match(/#\s(.*)/)?.[1];
    res.json({
      title,
      recipe: recipeResponse,
      imgURL: `data:image/png;base64, ${OpenAIResponse1.data[0].b64_json}`,
    });
  } catch (error) {
    next(error);
  }
});

// ---------------Display resulted recipes on Your Recipes----------------------------

app.get('/api/recipes', authMiddleware, async (req, res, next) => {
  try {
    const sql = `select * from "Recipes"
                where "userId" = $1;`;

    const params = [req.user?.userId];
    const result = await db.query(sql, params);
    const recipes = result.rows;
    if (!recipes.length) {
      throw new ClientError(404, 'No recipes are available');
    }

    res.json(recipes);
  } catch (error) {
    next(error);
  }
});

// ---------------Display resulted recipes on Your Recipes----------------------------

// -------------- Display certain recipe's details in side window or in your recipes  ----------------------------------

app.get('/api/recipes/:recipeId', authMiddleware, async (req, res, next) => {
  try {
    const { recipeId } = req.params;
    if (!recipeId) {
      throw new ClientError(400, 'Please recipe ID');
    }

    const sql = `select * from "Recipes"
                 where "recipeId" = $1 and "userId" = $2 `;

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

    const { responseTitle, requestIngredient, responseInstruction, imgURL } =
      req.body;
    if (
      !responseTitle ||
      !requestIngredient ||
      !responseInstruction ||
      !imgURL
    ) {
      throw new ClientError(400, "Missing request's body");
    }
    const sql = `insert into "Recipes" ("responseTitle", "requestIngredient", "responseInstruction", "imgURL", "userId")
                 values ($1, $2, $3, $4, $5)
                 returning *`;

    const params = [
      responseTitle,
      requestIngredient,
      responseInstruction,
      imgURL,
      req.user?.userId,
    ];
    const result = await db.query(sql, params);
    const newRecipe = result.rows[0];
    if (!newRecipe) {
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
