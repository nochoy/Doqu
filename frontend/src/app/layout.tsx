import type { Metadata } from 'next';
import { Inter, Poppins, Merriweather } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-sans',
  fallback: ['ui-sans-serif', 'sans-serif', 'system-ui'],
});
const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-serif',
  fallback: ['ui-serif', 'serif']
});

export const metadata: Metadata = {
  title: {
    default: 'Doqu - Interactive Quiz Platform',
    template: '%s | Doqu',
  },
  description: 'Create and play interactive quizzes in real-time',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} ${merriweather.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
