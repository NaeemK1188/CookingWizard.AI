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
app.use(express.json({ limit: '5mb' })); // increasing limit of body request to 5mb because im using base64,
// instead of uploading since openAI image url disappears after one hour, so im using alternative approach
// of base64 instead of file upload using url

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

// why userId is included in sql query because its a unique identifier for each user
// in database and because its used as a foreign key in Recipes table
app.post('/api/auth/sign-in', async (req, res, next) => {
  // what is happening here in this end-point, when user click sign in in front-end, it make
  // fetch request to this end-point by sending the body request :username and password
  // this endpoint gets the the body, then checks if the body missing any contents
  // if the body request correct, it initiates sql query to get the requested information to
  // the front end. if the user does not exists, it throws an error, and if the password or username
  // are wrong, it throws an error
  // if its valid, it generate token for the user that exists in the database
  try {
    // or using const { username, password } = req.body as Partial<Auth>;
    // partial makes fields of <Auth> object optional
    // Auth object contains username and password as string type
    const { username, password, guest } = req.body;
    // sw we treat it as {username, password} and {guest}
    // because in the httpie we can only send one parameter guest = true although
    // the body has three parameters

    // if (guest === true) {
    //   const sql = `select "userId", "username"
    //                from "Users"
    //                where "username"= $1;`;
    //   const params = ['guest'];
    //   const result = await db.query(sql, params);
    //   const guestUser = result.rows[0];
    //   console.log(guestUser);
    //   const payload = {
    //     userId: guestUser.userId,
    //     username: guestUser.username,
    //   };

    //   const token = jwt.sign(payload, hashKey);
    //   // we need to use the same keys naming in the front end
    //   return res.status(200).json({ user: payload, token });
    // }

    // regular login using username and password
    // if guest === false

    if (!username || !password) {
      throw new ClientError(
        400,
        'username or password is missing from the body request'
      );
    }

    // we need to select username too in order to display it in the response json
    // what we are selecting, what will be in the res.json() to front end fetch
    // so front end can access these properties
    const sql = `select "userId", "username", "hashedPassword"
                 from "Users"
                 where "username" = $1;`; // sql query selected "userId", "username", and "hashedPassword"
    const params = [username]; // because we only have one param that is [username]
    const result = await db.query(sql, params);
    const user = result.rows[0];
    if (!user) {
      // the error user not exists or invalid login information
      throw new ClientError(401, 'invalid login information');
    }
    const isPassValid = await argon2.verify(user.hashedPassword, password);

    if (!isPassValid) {
      throw new ClientError(401, 'invalid login password');
    }

    if (isPassValid) {
      // userId who is the user, what kind of user guest or not
      // what data to fetch Recipes where userId = ?
      const payload = {
        userId: user.userId,
        username: user.username,
      };
      // resets the guest after getting verified because only using state in front end
      // wont delete the recipes after logging in because the database has the data, not
      // the front end which using state that only controls display, but the data
      // still exists. So, we need to delete it from backend here
      // now everytime guest user log in it deletes all recipes automatically
      if (user.username === 'guest') {
        const deleteSql = `delete from "Recipes"
                          where "userId" = $1`;
        const params = [user.userId]; // this user.userId is from the query or database not yet authenticated
        // so we cannot use req.user?.userId because we dont have the token yet, and we can see that, we dont have
        // the authmiddleware attached at the top
        await db.query(deleteSql, params); // here we are just sending query to database not storing any value
      }
      const token = jwt.sign(payload, hashKey); // creating a token to us after sign in
      res.status(200).json({ user: payload, token }); // token:token
      // on client side we will be getting user and token as a response
      // so we need to create an object in the front-end to access the values from server
    }
  } catch (error) {
    next(error);
  }
});

// we can call the endpoint anything
// we use authmiddleware because we need to verify the token after signing in
// because this end point requires authentication for the user
// which is used in post, get, and delete requests for a user that has
// a token
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

    const OpenAIResponse1 = await openai.images.generate({
      prompt: `A professional dish of ${requestIngredient} on plate, styled
      for a cooking blog contained within the size of 512x512 image dimension`,
      n: 1,
      size: '512x512',
      // response_format: 'url',
      response_format: 'b64_json',
    });

    // console.log(OpenAIResponse1.data[0].url);

    // extracting the entire response from OpenAI
    const recipeResponse = OpenAIResponse.choices[0].message.content;
    console.log(recipeResponse); // output in server terminal

    // using regex(regular expression language) on a text
    // extracting title from the AI response
    const title = recipeResponse?.match(/#\s(.*)/)?.[1]; // using regular expression to get everything after # and stops and first of \n.
    // then we are extracting the second element of the array returned that is the title because ".match" returns the target and the result in one array
    // output is json format
    res.json({
      title,
      recipe: recipeResponse,
      // imageUrl: OpenAIResponse1.data[0].url
      imgURL: `data:image/png;base64, ${OpenAIResponse1.data[0].b64_json}`,
    });
    // using base64 instead of url making us able to save the image automatically without the need
    // to use url that disappears after one hour
    // data:image/png, this tells the browser that the image is .png type
    // base64 and image is encoded64
    // ${OpenAIResponse1.data[0].b64_json} will be 64 value of the image
    // here we can put "title" instead "title:title"
    // we need to use the same naming of variables in the front end
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
    const recipes = result.rows; // why its not rows[0] ?
    // if the recipes array of object recipe is empty
    if (!recipes.length) {
      // if recipes do not exist for certain user
      throw new ClientError(404, 'No recipes are available');
    }

    res.json(recipes); // sending back everything to back end
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
    // we user req.user?.userId to verify that the user has the token
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
    // here its like req.body.imgURL
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
                 returning *`; // returning everything to front end, which its in our res.json() ?
    // req.user?.userId or .user?.userId comes from authMiddleware

    // testing users when we don't have sign in sign up ready
    // [responseTitle, requestIngredient, responseInstruction, req.user?.userId ?? 1]; // adding new recipe for userId = 1

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
