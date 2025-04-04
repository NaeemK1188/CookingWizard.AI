import './App.css';
import { Routes, Route } from 'react-router-dom';
import { AppDrawer } from './components/AppDrawer';
import { HomePage } from './Pages/HomePage';
import { NewRecipe } from './Pages/NewRecipe';
import { Recipes } from './Pages/Recipes';
import { RecipeDetails } from './Pages/RecipeDetails';
import { UserProvider } from './Pages/UserContext';
import { SignInForm } from './Pages/SignInForm';
import { RegistrationForm } from './Pages/RegistrationForm';

// title, recipe are from the response from the /api/new-recipe
// because server.ts at /api/new-recipe endpoint is sending
// res.json({ title, recipe: recipeResponse }), which is an object Recipe
// use export to pass the Recipe as a prop
// this is only type not the object. Its like saying it should be
export type Recipe = {
  // we dont have ro declare it here, instead we can use spread operator in
  // handleAdd() and add new property userId to the existing ewRecipe object
  userId?: number; // adding it so we can filter recent recipes for each user in AppDrawer
  // making it optional to remove error in handleAdd
  recipeId: number; // it has to b the same name in table in recipes table
  responseTitle: string; // like the server body property not title
  responseInstruction: string;
  recipe: string; // same  variable naming to what in the post request response in openAI endpoint in res.json
  title: string; // same variable naming to what in the post request response in openAI endpoint in res.json
  imageUrl: string;
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
          <Route path="auth/sign-in" element={<SignInForm />} />
          {/* mode key(variable) holds sign-in value */}
          {/* using AuthPage mode="sign-ip" only to make it reusable */}
          <Route path="auth/sign-up" element={<RegistrationForm />} />
          {/* using AuthPage mode="sign-up" only to make it reusable */}
          <Route path="new-recipe" element={<NewRecipe />} />
          <Route path="recipes" element={<Recipes />} />
          <Route path="recipes/:recipeId" element={<RecipeDetails />} />
        </Route>
      </Routes>
    </UserProvider>
  );
}
