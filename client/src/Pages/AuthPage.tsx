import { RegistrationForm } from './RegistrationForm';
import { SignInForm } from './SignInForm';

type Props = {
  mode: 'sign-up' | 'sign-in';
};

// unnecessary only to make AuthPage reusable
export function AuthPage({ mode }: Props) {
  return (
    <div>
      {/* if mode === "sign-up" */}
      {mode === 'sign-up' && <RegistrationForm />}
      {/* if mode === "sign-in" */}
      {mode === 'sign-in' && <SignInForm />}
    </div>
  );
}
