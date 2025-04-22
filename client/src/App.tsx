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


export type Recipe = {
  userId?: number;
  recipeId: number;
  responseTitle: string;
  responseInstruction: string;
  recipe: string;
  title: string;
  imgURL: string;
};

export default function App() {
  return (
    <UserProvider>
      <Routes>
        <Route path="/" element={<AppDrawer />}>
          <Route index element={<HomePage />} />
          <Route path="auth/sign-in" element={<SignInForm />} />
          <Route path="auth/sign-up" element={<RegistrationForm />} />
          <Route path="new-recipe" element={<NewRecipe />} />
          <Route path="recipes" element={<Recipes />} />
          <Route path="recipes/:recipeId" element={<RecipeDetails />} />
        </Route>
      </Routes>
    </UserProvider>
  );
}
