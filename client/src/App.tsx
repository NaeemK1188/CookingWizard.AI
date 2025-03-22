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
// use export ot pass the Recipe as a prop
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
