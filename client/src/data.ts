import { type Auth } from './Pages/SignInForm';
import { type User } from './Pages/RegistrationForm';

const authKey = 'um.auth';

export function readUser(): User | undefined {
  const auth = localStorage.getItem(authKey);
  if (!auth) {
    return undefined;
  }
  return (JSON.parse(auth) as Auth).user;
}

export function readToken(): string | undefined {
  const auth = localStorage.getItem(authKey);
  if (!auth) {
    return undefined;
  }
  return (JSON.parse(auth) as Auth).token;
}
