import './SignInForm.css';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from './RegistrationForm';
import { useUser } from './useUser';

export type Auth = {
  user: User;
  token: string;
};

export function SignInForm() {
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

      const { user, token } = (await responseData.json()) as Auth;
      handleSignIn(user, token);
      navigate('/');
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
        body: JSON.stringify({ username: 'guest', password: '12345678' }),
      };
      const responseData = await fetch('/api/auth/sign-in', req);
      if (!responseData.ok) {
        throw new Error(`fetch Error ${responseData.status}`);
      }
      const { user, token } = (await responseData.json()) as Auth;
      handleSignIn(user, token);
      navigate('/');
    } catch (error) {
      alert(`Error signing in: ${error}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-img-open">
      <div className="container-SignIn">
        <div className="row">
          <div className="column-full">
            <h2 className="h2-register">Sign In</h2>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="d-flex flex-column">
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
          <div>
            <button disabled={isLoading} className="btn-style-register">
              Login
            </button>
            <button
              type="button"
              disabled={isLoading}
              className="btn-style-register"
              onClick={handleGuestSubmit}>
              Continue as a guest
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
