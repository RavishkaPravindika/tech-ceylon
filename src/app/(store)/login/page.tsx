import type { Metadata } from 'next';
import { LoginClient } from './LoginClient';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Tech Ceylon account to save your cart and track orders.',
};

export default function LoginPage() {
  return <LoginClient />;
}
