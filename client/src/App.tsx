import './App.css';
import { Routes, Route } from 'react-router-dom';
import { AppDrawer } from './components/AppDrawer';
import { HomePage } from './Pages/HomePage';
import { NewRecipe } from './Pages/NewRecipe';
import { Recipes } from './Pages/Recipes';
import { RecipeDetails } from './Pages/RecipeDetails';

import { UserProvider } from './Pages/UserContext';
// import {AuthPage} from './Pages/AuthPage';
import { SignInForm } from './Pages/SignInForm';
import { RegistrationForm } from './Pages/RegistrationForm';

// title, recipe are from the response from the /api/new-recipe
// because server.ts at /api/new-recipe endpoint, its sending
// res.json({ title, recipe: recipeResponse }) an object Recipe
// use export ot pass the Recipe as a prop
export type Recipe = {
  recipeId: number; // it has to b the same name in table in recipes table
  responseTitle: string; // like the server body property not title
  responseInstruction: string;
  recipe: string; // same  variable naming to what in the post request response in openAI endpoint in res.json
  title: string; // same variable naming to what in the post request response in openAI endpoint in res.json
};

export default function App() {
  // both wil be changing on display and constantly changing, so there states are changing
  return (
    // routes don't need to be in order and we can name them anything
    // Now user can access all pages using UserProvider component from UserContext.tsx
    <UserProvider>
      <Routes>
        {/* the header side window or can be at the top that will be always in the home page at "/"
      and every page */}
        {/* these are function calls which first one(AppDrawer) is calling AppDrawer function or component and
      and returning the all the UI elements */}
        <Route path="/" element={<AppDrawer />}>
          {/* home page at "/" */}
          <Route index element={<HomePage />} />
          {/* why its working in code journal backend ? */}
          <Route path="auth/sign-in" element={<SignInForm />} />
          {/* mode key(variable) holds sign-in value */}
          {/* using AuthPage mode="sign-ip" only to make it reusable */}
          {/* <Route path="/sign-in" element={<AuthPage mode="sign-in" />} /> */}
          <Route path="auth/sign-up" element={<RegistrationForm />} />
          {/* using AuthPage mode="sign-up" only to make it reusable */}
          {/* <Route path="/sign-up" element={<AuthPage mode="sign-up"/>}/> */}
          <Route path="new-recipe" element={<NewRecipe />} />
          <Route path="recipes" element={<Recipes />} />
          <Route path="recipes/:recipeId" element={<RecipeDetails />} />
        </Route>
      </Routes>
    </UserProvider>
  );
}
