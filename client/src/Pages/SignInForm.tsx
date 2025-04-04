import './SignInForm.css';
import { type OutletContextType } from './NewRecipe';
import { useOutletContext } from 'react-router-dom';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from './RegistrationForm';
import { useUser } from './useUser';

export type Auth = {
  user: User;
  token: string;
};

export function SignInForm() {
  const { isopen } = useOutletContext<OutletContextType>();
  const { handleSignIn } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    setIsLoading(true);
    event.preventDefault();

    try {
      const formData = new FormData(event.currentTarget);
      const userData = Object.fromEntries(formData);
      const req = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      };

      const responseData = await fetch('/api/auth/sign-in', req);
      if (!responseData.ok) {
        throw new Error(`fetch Error ${responseData.status}`);
      }

      const { user, token } = (await responseData.json()) as Auth; // we took user and token from Auth
      handleSignIn(user, token); // calling handleSignIn from UserContext.tsx
      // with update user and token values
      console.log('signed in user', user);
      console.log('received token', token);
      navigate('/'); // navigate to homepage
    } catch (error) {
      alert(`Error signing in: ${error}`);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGuestSubmit() {
    try {
      const req = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guest: true }),
      };
      const responseData = await fetch('/api/auth/sign-in', req);
      if (!responseData.ok) {
        throw new Error(`fetch Error ${responseData.status}`);
      }
      const { user, token } = (await responseData.json()) as Auth;
      handleSignIn(user, token);
      console.log('signed in user', user);
      console.log('received token', token);
      navigate('/');
    } catch (error) {
      alert(`Error signing in: ${error}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={isopen === true ? 'bg-img-open' : 'bg-img-close'}>
      <div className="container-register">
        <div className="row">
          <div className="column-full">
            <h2 className="h2-register">Sign In</h2>
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
          {/* disabled={isLoading} to prevent user from clicking the button after the first time*/}
          <button disabled={isLoading} className="btn-style-register">
            Login
          </button>
        </form>
        <button
          disabled={isLoading}
          className="btn-style-register"
          onClick={handleGuestSubmit}>
          Continue as a guest
        </button>
      </div>
    </div>
  );
}
