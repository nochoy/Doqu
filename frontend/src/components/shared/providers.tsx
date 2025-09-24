'use client';

import { AuthProvider } from '@/contexts/authContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider as NextThemeProvider } from 'next-themes';

function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemeProvider>) {
  return <NextThemeProvider {...props}>{children}</NextThemeProvider>
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!googleClientId) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider 
      attribute='class' 
      defaultTheme='system' 
      enableSystem 
      disableTransitionOnChange
    >
      <AuthProvider>
        <GoogleOAuthProvider clientId={googleClientId}>{children}</GoogleOAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
