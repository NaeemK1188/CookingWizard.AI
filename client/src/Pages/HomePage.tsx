import './HomePage.css';

export function HomePage() {


  return (
    <div className="bg-img-open">
      <div className="container-page">
        <div className="row justify-center margin-left-home margin-top-home">
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
