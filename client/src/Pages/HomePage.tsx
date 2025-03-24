// import { Link } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { type OutletContextType } from './NewRecipe';
import './HomePage.css';

export function HomePage() {
  const { isopen } = useOutletContext<OutletContextType>();

  return (
    <div className={isopen === true ? 'bg-img-open' : 'bg-img-close'}>
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
