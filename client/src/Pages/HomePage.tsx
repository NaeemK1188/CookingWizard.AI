// import { Link } from 'react-router-dom';
import './HomePage.css';

export function HomePage() {
  return (
    <div className="bg-img">
      <div className="container-home-page">
        <div className="row">
          <div className="column-half text-alignmnt">
            <p>
              Unlock culinary magic with Cooking Wizard AI! Easily create
              personalized recipes using ingredients from you pantry. Sign up
              now and start cooking with ease.
            </p>
          </div>
          <div className="column-half">
            <img src="chic-img.png" alt="chicken" className="position-icon" />
          </div>
        </div>
      </div>
    </div>
  );
}

// <p className="text-alignmnt">
//    Unlock culinary magic with Cooking Wizard AI! Easily create
//   personalized recipes using ingredients from you pantry. Sign up now and
//   start cooking with ease.
// </p>

//  <div className="container">
//    <div className="row">
//      <div className="column-half">
//        <p className="text-alignmnt">
//          Unlock culinary magic with Cooking Wizard AI! Easily create
//          personalized recipes using ingredients from you pantry. Sign up now and
//          start cooking with ease.
//        </p>
//      </div>

//    </div>
//  </div>;

//------------------ testing routing ---------------------------------------
//  <h1>This is Cooking Wizard HomePage</h1>
//       <Link to="/recipes">
//         &lt; Navigate to recipes
//       </Link>
//       <Link to="/new-recipe">
//          &lt; Navigate to New Recipe
//       </Link>
//       <Link to="/recipes/:recipeId">
//          &lt; Navigate to recipe Details
//       </Link>
//------------------ testing routing ---------------------------------------
