import { NavLink, Outlet } from 'react-router-dom';
import './AppDrawer.css';
import { VscThreeBars } from 'react-icons/vsc';
import { PiUserCircleLight } from 'react-icons/pi';

//<PiUserCircleLight />
export function AppDrawer() {
  return (
    <>
      <header>
        <div className="container ctrl-height-header">
          <div className="row ">
            <div className="column-full d-flex justify-between">
              <div>
                <VscThreeBars size={40} className="cursor-click" />
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
          <div className="menu-drawer is-open">
            <h3 className="menu-heading">Cooking Wizard</h3>
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
                Recent Recipes:
                <NavLink to="/recipes/8" className="menu-link">
                  new recipe
                </NavLink>
              </li>
              <li>
                <button className="btn-style">Sign in</button>
                <button className="btn-style">Sign up</button>
              </li>
            </ul>
          </div>
        </aside>
        <div className="grow">
          <Outlet />
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
