import { createContext, ReactNode, useEffect, useState } from 'react';
import { User } from './RegistrationForm';
import { readToken, readUser } from '../data';

// declaring type or object with variables
export type UserContextValues = {
  user: User | undefined;
  token: string | undefined;
  handleSignIn: (user: User, token: string) => void; // declaring function signIn
  handleSignOut: () => void; // declaring function signOut
};

// why we are creating context ?
// we can see its an initial values been given to UserContext or default values
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

// so user can access all pages
// children here are all the child components or pages under <UserProvider>
export function UserProvider({ children }: Props) {
  // because we have user signing in which is a state

  const [user, setUser] = useState<User>();
  const [token, setToken] = useState<string>();
  useEffect(() => {
    setUser(readUser());
    setToken(readToken());
  }, []);

  // we are getting user and token from somewhere or handleSignIn is getting
  // called with two parameters user and token
  function handleSignIn(user: User, token: string) {
    setUser(user);
    setToken(token);
    // save authorization
    const auth: Auth = { user, token };
    localStorage.setItem(authKey, JSON.stringify(auth));
  }

  function handleSignOut() {
    setUser(undefined);
    setToken(undefined);
    //remove authorization
    localStorage.removeItem(authKey);
  }

  // properties are {user: user, token:token, handleSignIn:handleSignIn , handleSignOut:handleSignOut }
  // these properties are from userProvider not from the above UserContext or UserContextValues
  // why did we create UserContext or UserContextValues ?
  // why did we create contextValue ?
  const contextValue = { user, token, handleSignIn, handleSignOut };
  return (
    // we are passing the contextValue that contain(user, token, handleSignIn, handleSignOut)
    // to all pages or children pages
    <UserContext.Provider value={contextValue}>
      {/* the children here are the pages under UserProvider in App.tsx */}
      {children}
    </UserContext.Provider>
  );
}
