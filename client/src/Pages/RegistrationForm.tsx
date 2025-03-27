import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type OutletContextType } from './NewRecipe';
import { useOutletContext } from 'react-router-dom';
import './RegistrationForm.css';

// userId: number username: string are from the returned json from sign-up endpoint
// where the sql query returned userId, username, and createdAt. But we took only username and userId
export type User = {
  userId: number;
  username: string;
};

// its the auth/sign-up endpoint
export function RegistrationForm() {
  const { isopen } = useOutletContext<OutletContextType>();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); // to navigate like creating a Link tag, but outside jsx

  // we are passing an event of DOM element that is Form
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    setIsLoading(true);
    event.preventDefault(); // prevent default submission
    try {
      // using Formdata() and fromEntries() when we have uncontrolled form
      // so we dont use values and onChange event on inputs
      const formData = new FormData(event.currentTarget);
      const userData = Object.fromEntries(formData);
      console.log(userData); // getting what in label and input or all Form entries
      //{ "username": "Mazrok122", "password": "3333333"}
      const req = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData), // sending body as a json of username and password
      };

      const responseData = await fetch('/api/auth/sign-up', req);
      if (!responseData.ok) {
        throw new Error(`fetch Error ${responseData.status}`);
      }
      const user = (await responseData.json()) as User;
      console.log('Registered User:', user);
      alert(
        `Successfully ${user.username} is registered and userId is ${user.userId}`
      );
      navigate('/auth/sign-in');
    } catch (error) {
      alert(`Error registering user: ${error}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    // unnecessary since the aside bar has been fixed ternary statement. Just use bg-img-open
    <div className={isopen === true ? 'bg-img-open' : 'bg-img-close'}>
      <div className="container-register">
        <div className="row">
          <div className="column-full">
            <h2 className="h2-register">Register</h2>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="column-full d-flex flex-column add-margin">
              <label className="add-padding">
                Username&nbsp;
                <input name="username" type="text" />
              </label>
              <label>
                Password&nbsp;
                <input name="password" type="password" />
              </label>
            </div>
          </div>
          <div className="row">
            <div className="column-full">
              {/* disabled={isLoading} to prevent user from clicking the button after the first time*/}
              <button disabled={isLoading} className="btn-style-register">
                Register
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// return (
//   <div className={isopen === true ? 'bg-img-open' : 'bg-img-close'}>
//     <div className="container-home-page">
//       <div className="row">
//         <div className="column-half text-alignmnt">
//           <p>
//             Unlock culinary magic with Cooking Wizard AI! Easily create
//             personalized recipes using ingredients from you pantry. Sign up now
//             and start cooking with ease.
//           </p>
//         </div>
//         <div className="column-half">
//           <img src="chic-img.png" alt="chicken" className="position-icon" />
//         </div>
//       </div>
//     </div>
//   </div>
// );
