import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RegistrationForm.css"

// userId: number username: string are from the returned json from sign-up endpoint
// where the sql query returned userId, username, and createdAt. But we took only username and userId
export type User = {
  userId: number;
  username: string;
}

// its the auth/sign-up endpoint
export function RegistrationForm()
{

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); // to navigate like creating a Link tag, but outside jsx




  return (
    <div className="container">
      <div className="row">
        <div className="column-full">
          <h2>Register</h2>
        </div>
      </div>
      <div className="row">
        <div className="column-full">
          <label>
            Username
            <input name="username" type="text"/>
          </label>
        </div>
      </div>
    </div>
  );
}
