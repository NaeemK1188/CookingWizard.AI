import { NavLink, Outlet } from 'react-router-dom';
import './AppDrawer.css';
import { VscThreeBars } from 'react-icons/vsc';
import { PiUserCircleLight } from 'react-icons/pi';
import { useState, useEffect } from 'react';
import { Recipe } from '../App';
import { useUser } from '../Pages/useUser';
import { useNavigate } from 'react-router-dom';


export function AppDrawer()
{
  const [isOpen, setIsOpen] = useState(true);
  const [responseRecipe, setResponseRecipe] = useState<Recipe>();
  const [recentRecipes, setRecentRecipes] = useState<Recipe[]>([]);
  const { user, handleSignOut } = useUser();
  const navigate = useNavigate();
  let headingText = "";
  let is_Open = "";
  let menuName = "";
  let signIn = "";



  useEffect(() => {
    if (!user)
    {
      setRecentRecipes([]);
    }
  }, [user]);

  function handleLinkClick()
  {
    if (window.innerWidth < 480)
    {
      setIsOpen(false);
    }
  }

  function handleDrawer()
  {
    if (isOpen === true)
    {
      setIsOpen(false);
    }
    else if (isOpen === false)
    {
      setIsOpen(true);
    }
  }


  function handleAdd(newRecipe: Recipe)
  {
    const newRecipeWithId = { ...newRecipe, userId: user?.userId };
    if (recentRecipes)
    {
      setRecentRecipes(recentRecipes.concat(newRecipeWithId));
    }
  }

  if (isOpen === true && !user)
  {
    is_Open = 'is-open';
    headingText = 'Cooking Wizard';
  }
  else if (isOpen === true && user)
  {
    is_Open = 'is-open';
    headingText = 'Cooking Wizard';
    menuName = 'Recent Recipes:';
    signIn = `Signed in as ${user.username.toLocaleUpperCase()}`;
  }
  else if (isOpen === false)
  {
    is_Open = 'is-close';
    headingText = "";
    menuName = "";
    signIn = "";
  }

  return (
    <>
      <header>
        <div className="container ctrl-height-header">
          <div className="row ">
            <div className="column-full d-flex justify-between">
              <div>
                <VscThreeBars size={40} className="cursor-click" onClick={handleDrawer}/>
              </div>
              <div className="white-cir-user">
                {user ? (
                  <h1 className="h1-drawer-header">
                    {user.username[0].toLocaleUpperCase()}
                    {user.username[user.username.length - 1].toLocaleUpperCase()}
                  </h1>) : (<PiUserCircleLight size={50} />)}
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="d-flex">
        <aside className="d-flex bg-color">
          <div className={`menu-drawer ${is_Open}`}>
            <h3 className="menu-heading">{headingText}</h3>
            <ul className="menu-items">
              <li className="menu-item">
                <NavLink to="/new-recipe" className="menu-link" onClick={handleLinkClick}>
                  <img src="/pan-resized-removebg-preview.png" alt="pan" className="item-icon"/>
                  New Recipe
                </NavLink>
              </li>
              <li className="menu-item">
                <NavLink to="/recipes" className="menu-link" onClick={handleLinkClick}>
                  <img src="/noodlesIcon-resized-removebg-preview.png" alt="noodles" className="item-icon-resize-noodles"/>
                  Your Recipes
                </NavLink>
              </li>
              <li className="menu-item">
                <NavLink to="/" className="menu-link" onClick={handleLinkClick}>
                  <img src="/resized-recipe-removebg-preview.png" alt="recipe" className="item-icon-resize-noodles"/>
                  Home
                </NavLink>
              </li>
              <li className="recent-items">
                <>
                  <h4>{menuName}</h4>
                  {(user && isOpen) && recentRecipes?.filter((recipe) => recipe.userId === user.userId).map((recentRecipe, index) => (
                        <div key={index}>
                          <h5>
                            {index + 1}. {recentRecipe.title}
                          </h5>
                        </div>))}
                  {(user && recentRecipes.length === 0 && isOpen === true) && <p>you don't have any recent search</p>}
                </>
              </li>
              {isOpen === true ? (
                <li>
                  {!user && (
                    <>
                      <button className="btn-style" onClick={() => { navigate('/auth/sign-in'); setIsOpen(false);}}>
                        Sign in
                      </button>
                      <button className="btn-style" onClick={() => {navigate('/auth/sign-up'); setIsOpen(false);}}>
                        Sign up
                      </button>
                    </>
                  )}
                  {user && (
                    <button className="btn-style" onClick={() => {handleSignOut(); navigate('/auth/sign-in'); setIsOpen(false);}}>
                      Sign out
                    </button>
                  )}
                </li>) : ("")}
              {!user && <p className="recent-items">{signIn}</p>}
              {user && <p className="recent-items">{signIn} </p>}
            </ul>
          </div>
        </aside>
        <div className="grow">
          <Outlet context={{
              set_Recent_Recipes: handleAdd,
              set_Response_Recipe: setResponseRecipe,
              recent_recipe: responseRecipe,
            }}/>
        </div>
      </div>
    </>
  );
}
