import {useContext} from 'react';
import {UserContext, UserContextValues} from './UserContext';

// declaring function returning UserContextValues object o type UserContextValues
// from UserContext file
// why we are creating useUser function
export function useUser(): UserContextValues
{
  const values = useContext(UserContext);
  if (!values)
  {
    throw new Error("useUser must be used inside a useProvider");
  }

  return values;
}
