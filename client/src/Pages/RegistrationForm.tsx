import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegistrationForm.css';


export type User = {
  userId: number;
  username: string;
};

export function RegistrationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    setIsLoading(true);
    event.preventDefault();
    try {
      const formData = new FormData(event.currentTarget);
      const userData = Object.fromEntries(formData);
      console.log(userData);
      const req = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      };

      const responseData = await fetch('/api/auth/sign-up', req);
      if (!responseData.ok) {
        throw new Error(`fetch Error ${responseData.status}`);
      }
      const user = (await responseData.json()) as User;
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
    <div className="bg-img-open">
      <div className="container-SignIn">
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
