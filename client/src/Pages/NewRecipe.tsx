import './NewRecipe.css';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { GiCampCookingPot } from 'react-icons/gi';
import { TfiSave } from 'react-icons/tfi';

export function NewRecipe() {
  return (
    <div className="bg-img">
      <div className="container-new-recipe">
        <div className="d-flex flex-dir ">
          <div className="row">
            <div className="column-full">
              <p className="font-color">
                Welcome to Cooking wizard AI. Enter ingredients below.....
              </p>
            </div>
          </div>
          <div>
            <div className="row">
              {/*  column-full is acting as a container*/}
              <div className="column-full">
                {/* textarea is acting as a row */}
                <textarea
                  name="request"
                  cols={70}
                  rows={6}
                  placeholder="what do you have in pantry ?"
                  className="request-container"
                />
                {/* div is acting as a row and has 4 columns icons */}
                <div>
                  <GiCampCookingPot className="add-margin" />
                  <RiDeleteBin6Line className="add-margin" />
                  <TfiSave className="add-margin" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------texting routing ------------------------------------------
// <div>
//   <h1>This is New recipe page</h1>
//   <Link to="/">&lt; Back to Homepage</Link>
//   <Link to="/recipes">&lt; Navigate to recipes</Link>
//   <Link to="/recipes/:recipeId">&lt; Navigate to recipe Details</Link>
// </div>
// ---------------------texting routing ------------------------------------------

//  <div className="d-flex flex-dir" style={{ minHeight: '100vh' }}>
//    <div className="column">
//      <p className="font-color">
//        Welcome to Cooking wizard AI. Enter ingredients below.....
//      </p>
//    </div>
//    <div className="column">
//      <textarea
//        name="request"
//        cols={70}
//        rows={6}
//        placeholder="what do you have in pantry ?"
//        className="request-container"
//      />
//      <div>
//        <GiCampCookingPot className="add-margin" />
//        <RiDeleteBin6Line className="add-margin" />
//        <TfiSave className="add-margin" />
//      </div>
//    </div>
//  </div>;
