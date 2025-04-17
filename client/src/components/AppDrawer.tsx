import { NavLink, Outlet } from 'react-router-dom';
import './AppDrawer.css';
import { VscThreeBars } from 'react-icons/vsc';
import { PiUserCircleLight } from 'react-icons/pi';
import { useState, useEffect } from 'react';
import { Recipe } from '../App';
import { useUser } from '../Pages/useUser';
import { useNavigate } from 'react-router-dom';
// import { LiaUserTimesSolid } from 'react-icons/lia';

export function AppDrawer() {
  const [isOpen, setIsOpen] = useState(true);
  // set it null when i don't have any recipes, and type
  // recipe because i will be receiving from NewRecipe component a new recipe object
  // that has a recipe and recipe title
  const [responseRecipe, setResponseRecipe] = useState<Recipe>();
  const [recentRecipes, setRecentRecipes] = useState<Recipe[]>([]);
  const { user, handleSignOut } = useUser(); // creating custom hook and we destructuring from it user
  // and handleSignOut props in UserContext.tsx
  const navigate = useNavigate();
  let headingText = '';
  let is_Open = '';
  let menuName = '';
  let signIn = '';

  // we can see here that the responseRecipe got updated with the new recipe from newRecipe
  console.log('responseRecipe in AppDrawer:', responseRecipe?.imgURL);

  // first when its clicked, we change the state or add the change to event loop, then after
  // reading the entire component, and we check the event loop, we find new value of the isOpen, then we read the
  // if/else with the new values that will change the UI
  // solve the issue of the infinite re-render, because we cannot use stateSetter() in the jsx
  // and also it trigger the re-render whenever the user changes not on every re-render scheduled
  useEffect(() => {
    if (!user) {
      // useEffect here is responsible for clearing recent recipes on signout only
      //not for managing UI logic
      setRecentRecipes([]);
    }

    // else if (isOpen == false)DO NOT clear recentRecipes when the drawer is closed,
    // because the data should stay in memory (in state) — just hidden visually.
    // {
    //   setRecentRecipes([]); // causing to reset, so closing and opening again to not see recipes
    // }

    // else if (isOpen === true) causing infinite loop
    // {

    //      setRecentRecipes(recentRecipes?.filter((recipe) => recipe.userId === user.userId).map((recentRecipe, index) => (
    //       <div key={index}>
    //         <h5>
    //           {index + 1}. {recentRecipe.title}
    //         </h5>
    //       </div> )))

    // } getting infinite loop because we are using jsx inside setRecentRecipe or using jsx, where we need to only see
    //object where setRecentrecipe(expects, title:"R1", userId:123)
    // weare watching recentRecipes as a dependency, and inside this effect you're also modifying recentRecipes.
    // which causes an infinite loop
  }, [user]); // it runs whenever the user changes

  function handleDrawer() {
    if (isOpen === true) {
      setIsOpen(false);
    } else if (isOpen === false) {
      setIsOpen(true);
    }
  }

  // using add without being saved into the database
  function handleAdd(newRecipe: Recipe) {
    console.log('newRecipe', newRecipe);
    // if we don't add new value to userId, it will stay undefined
    // because only adding or updating userId in type Recipes its just a type not an object
    const newRecipeWithId = { ...newRecipe, userId: user?.userId };
    // use prev, when we are setting a state multiple times in a row
    // for simple state update, we can update state without prev
    if (recentRecipes) {
      setRecentRecipes(recentRecipes.concat(newRecipeWithId));
    }
  }

  if (isOpen === true && !user) {
    is_Open = 'is-open';
    headingText = 'Cooking Wizard';
    // menuName = 'Recent Recipes:';

    // setRecentRecipes(null);

    // signIn = 'not signed in';
  } else if (isOpen === true && user) {
    is_Open = 'is-open';
    headingText = 'Cooking Wizard';
    menuName = 'Recent Recipes:';
    signIn = `Signed in as ${user.username.toLocaleUpperCase()}`;
  } else if (isOpen === false) {
    is_Open = 'is-close';
    headingText = '';
    menuName = '';
    signIn = '';
    // to many re-renders
    // setRecentRecipes([]);
  }
  // const noUser = !user ? <div>Some text</div> : <div>Some other thing</div>
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
                {/* {user ? (<PiUserCircleLight size={50} />) : (<LiaUserTimesSolid size={50} />)} */}
                {user ? (
                  <h1 className="h1-drawer-header">
                    {user.username[0].toLocaleUpperCase()}
                    {user.username[
                      user.username.length - 1
                    ].toLocaleUpperCase()}
                  </h1>
                ) : (
                  <PiUserCircleLight size={50} />
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="d-flex">
        {/* Now both aside(side window and other pages will be flex) */}
        <aside className="d-flex bg-color">
          <div className={`menu-drawer ${is_Open}`}>
            <h3 className="menu-heading">{headingText}</h3>
            <ul className="menu-items">
              <li className="menu-item">
                <NavLink to="/new-recipe" className="menu-link">
                  <img
                    src="/pan-resized-removebg-preview.png"
                    alt="pan"
                    className="item-icon"
                  />
                  New Recipe
                </NavLink>
              </li>
              <li className="menu-item">
                <NavLink to="/recipes" className="menu-link">
                  <img
                    src="/noodlesIcon-resized-removebg-preview.png"
                    alt="noodles"
                    className="item-icon-resize-noodles"
                  />
                  Your Recipes
                </NavLink>
              </li>
              <li className="menu-item">
                <NavLink to="/" className="menu-link">
                  <img
                    src="/resized-recipe-removebg-preview.png"
                    alt="recipe"
                    className="item-icon-resize-noodles"
                  />
                  Home
                </NavLink>
              </li>
              {/* we will be doing the same thing in adding new recipes in your Recipes page */}
              <li className="recent-items">
                <>
                  <h4>{menuName}</h4>

                  {/* checks if the userId in Recipes table equals the userId in Users table
                  or if its the same user generating the  */}
                  {/* this is th right way to do it because it will expose every user data
                  instead doing it as a an endpoint */}
                  {/* on jsx we remove UI elements visually, but they still exist */}
                  {/* doing this method when we are not relying on api fetch */}
                  {/* the api end point can do the same filtering and its not exposing the entire data */}
                  {/* '(user && isOpen) &&' is one conditional statement, and the code executed after it is
                  recentRecipes?.filter((recipe) => recipe.userId.......*/}
                  {user &&
                    isOpen &&
                    recentRecipes
                      ?.filter((recipe) => recipe.userId === user.userId)
                      .map((recentRecipe, index) => (
                        <div key={index}>
                          <h5>
                            {index + 1}. {recentRecipe.title}
                          </h5>
                        </div>
                      ))}
                  {user && recentRecipes.length === 0 && isOpen === true && (
                    <p>you don't have any recent search</p>
                  )}

                  {/* causing infinite re-renders when setting the state inside the jsx(return ()) */}
                  {/* {!user && setRecentRecipes([])} */}
                  {/* has to have recipes after saving recent recipes and when refresh, they disappear */}
                  {/* {{recentRecipes.title, ...}} spread syntax wont work, so we use map*/}
                </>
              </li>
              {/* if isOpen === true add two buttons, when its close remove the buttons */}
              {isOpen === true ? (
                //  {!user && ( )} its treated as a return so we need to add one parent <> </>
                <li>
                  {/*  !user && or user && are each works as an if statement
                  we cannot do two functionalities in one if statement*/}
                  {!user && (
                    <>
                      {/* "auth/sign-in" like in the path property in app.tsx for SignInForm.tsx
                    we are using navigate because its button not a text with text use Link tag */}
                      <button
                        className="btn-style"
                        onClick={() => navigate('/auth/sign-in')}>
                        Sign in
                      </button>
                      <button
                        className="btn-style"
                        onClick={() => navigate('/auth/sign-up')}>
                        Sign up
                      </button>
                    </>
                  )}
                  {user && (
                    <button
                      className="btn-style"
                      onClick={() => {
                        handleSignOut();
                        navigate('/auth/sign-in');
                      }}>
                      Sign out
                    </button>
                  )}
                </li>
              ) : (
                ''
              )}
              {!user && <p className="recent-items">{signIn}</p>}
              {user && <p className="recent-items">{signIn} </p>}
            </ul>
          </div>
        </aside>
        <div className="grow">
          {/* i cannot use props inside the outlet because its a placeholder
          from react Router, it has to be a context
          ,so it can be used with all other pages(children) */}
          {/* we are not sending the state; only the state setter to update it from
          the NewRecipe component */}
          {/* instead of using function handleAdd that handle events, we can use the
          state setter function(setRecentRecipes) to understand what is happening  */}
          {/* we pass the key to get the value */}
          <Outlet
            context={{
              // isopen: isOpen,
              set_Recent_Recipes: handleAdd,
              set_Response_Recipe: setResponseRecipe,
              recent_recipe: responseRecipe,
            }}
          />
          {/* outlet is any page in our application, so it could be Recipes, HomePage, NewRecipe,
          RecipeDetails, ...  */}
          {/* we can pass the state RecentRecipes only if another component needs only to read it
          not updating it. Children communicate with parent using state handlers and parent
          communicate with children using props */}
        </div>
      </div>
    </>
  );
}
