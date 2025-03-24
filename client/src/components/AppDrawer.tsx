import { NavLink, Outlet } from 'react-router-dom';
import './AppDrawer.css';
import { VscThreeBars } from 'react-icons/vsc';
import { PiUserCircleLight } from 'react-icons/pi';
import { useState } from 'react';
import { Recipe } from '../App';

//<PiUserCircleLight />
export function AppDrawer() {
  const [isOpen, setIsOpen] = useState(true);
  // null to set it null when i dont have any recipes, and type
  // recipe because i will be receiving from NewRecipe component a new recipe object
  // that has a recipe and recipe title
  const [recentRecipes, setRecentRecipes] = useState<Recipe | null>();
  let headingText = '';
  let is_Open = '';
  let menuName = '';

  // first when its clicked, we change the state or add the change to event loop, then after
  // reading the entire component, and we check the event loop, we find new value of the isOpen, then we read the
  // if/else with the new values that will change the UI
  function handleDrawer() {
    if (isOpen === true) {
      setIsOpen(false);
    } else if (isOpen === false) {
      setIsOpen(true);
    }
  }

  if (isOpen === true) {
    is_Open = 'is-open';
    headingText = 'Cooking Wizard';
    menuName = ' Your Recipes:';
  } else if (isOpen === false) {
    is_Open = 'is-close';
    headingText = '';
    menuName = '';
  }
  // the component has to be used inside the return so it return something
  // this component is just being called, but not returning anything although
  // the NewRecipe jsx has a return, but here its not placed inside a return
  // <NewRecipe isopen={isOpen}/>;

  return (
    <>
      <header>
        <div className="container ctrl-height-header">
          <div className="row ">
            <div className="column-full d-flex justify-between">
              <div>
                <VscThreeBars
                  size={40}
                  className="cursor-click"
                  onClick={handleDrawer}
                />
              </div>
              <div className="white-cir-user">
                <PiUserCircleLight size={50} />
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="d-flex">
        {/* Now both aside(side window and other pages will be flex) */}
        <aside className="d-flex width-aside">
          <div className={`menu-drawer ${is_Open}`}>
            <h3 className="menu-heading">{headingText}</h3>
            <ul className="menu-items">
              <li className="menu-item">
                <NavLink to="/new-recipe" className="menu-link">
                  <img
                    src="pan-resized-removebg-preview.png"
                    alt="pan"
                    className="item-icon"
                  />
                  New Recipe
                </NavLink>
              </li>
              <li className="menu-item">
                <NavLink to="/recipes" className="menu-link">
                  <img
                    src="noodlesIcon-resized-removebg-preview.png"
                    alt="noodles"
                    className="item-icon-resize-noodles"
                  />
                  Your Recipes
                </NavLink>
              </li>
              <li className="menu-item">
                <NavLink to="/" className="menu-link">
                  <img
                    src="resized-recipe-removebg-preview.png"
                    alt="recipe"
                    className="item-icon-resize-noodles"
                  />
                  Home
                </NavLink>
              </li>
              <li className="menu-item">
                {menuName}
                {recentRecipes ? (
                  <NavLink to="/recipes/:recipeId" className="menu-link">
                    {/* has to have recipes after saving recent recipes and when refresh, they disappear */}
                    {/* {{recentRecipes.title, ...}} spread syntax wont work, so we use map*/}
                    {recentRecipes.title}
                  </NavLink>
                ) : (
                  ''
                )}
              </li>
              {/* if isOpen === true add two buttons, when its close remove the buttons */}
              {isOpen === true ? (
                <li>
                  <button className="btn-style">Sign in</button>
                  <button className="btn-style">Sign up</button>
                </li>
              ) : (
                ''
              )}
            </ul>
          </div>
        </aside>
        <div className="grow">
          {/* i cannot use props inside the outlet because its a placeholder
          from react Router, it has to be a context
          so it can be used with all other pages(children) */}
          {/* we are nor sending the state only the state setter to update it from
          the NewRecipe component */}
          <Outlet
            context={{ isopen: isOpen, set_Recent_Recipes: setRecentRecipes }}
          />
          {/* we can pass the state only RecentRecipes only if another component needs only to read it
          not updating it. Children communicate with parent using state handlers and parent
          communicate with children using props */}
        </div>
      </div>
    </>
  );
}

//  {
//    /* NavLink add extra styling to link  */
//  }
//  <nav className="px-4 text-white bg-gray-900">
//    <ul>
//      <li className="inline-block py-2 px-4">
//        <Link to="/about" className="text-white adding-cursor">
//          About
//        </Link>
//      </li>
//      <li className="inline-block py-2 px-4 adding-cursor">
//        <Link to="/" className="text-white adding-cursor">
//          Catalog
//        </Link>
//      </li>
//    </ul>
//  </nav>;

//------------testing header -------------------------
//  <NavLink to="/">
//         <h1>back to homePage</h1>
//       </NavLink>
//       <div>
//         {/* the current page displays in outlet*/}
//         <Outlet />
//       </div>
