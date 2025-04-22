import { useContext } from 'react';
import { UserContext, UserContextValues } from './UserContext';

export function useUser(): UserContextValues {
  const values = useContext(UserContext);
  if (!values) {
    throw new Error('useUser must be used inside a useProvider');
  }

  return values;
}
