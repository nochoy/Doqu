'use client';

import { AuthProvider } from '@/contexts/authContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function Providers({ children }: { children: React.ReactNode }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!googleClientId) {
    return <div>Loading...</div>;
  }

  return (
    <AuthProvider>
      <GoogleOAuthProvider clientId={googleClientId}>{children}</GoogleOAuthProvider>
    </AuthProvider>
  );
}
