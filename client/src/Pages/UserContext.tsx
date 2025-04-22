import { createContext, ReactNode, useEffect, useState } from 'react';
import { User } from './RegistrationForm';
import { readToken, readUser } from '../data';


export type UserContextValues = {
  user: User | undefined;
  token: string | undefined;
  handleSignIn: (user: User, token: string) => void;
  handleSignOut: () => void;
};

export const UserContext = createContext<UserContextValues>({
  user: undefined,
  token: undefined,
  handleSignIn: () => undefined,
  handleSignOut: () => undefined,
});

const authKey = 'um.auth';
type Auth = {
  user: User;
  token: string;
};

type Props = {
  children: ReactNode;
};

export function UserProvider({ children }: Props) {

  const [user, setUser] = useState<User>();
  const [token, setToken] = useState<string>();

  useEffect(() => {
    setUser(readUser());
    setToken(readToken());
  }, []);

  function handleSignIn(user: User, token: string) {
    setUser(user);
    setToken(token);
    const auth: Auth = { user, token };
    localStorage.setItem(authKey, JSON.stringify(auth));
  }

  function handleSignOut() {
    setUser(undefined);
    setToken(undefined);
    localStorage.removeItem(authKey);
  }

  const contextValue = { user, token, handleSignIn, handleSignOut };
  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}
