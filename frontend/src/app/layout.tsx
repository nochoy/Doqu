import type { Metadata } from 'next';
import { Inter, Poppins, Merriweather } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-sans',
});
const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: 'Doqu - Interactive Quiz Platform',
  description: 'Create and play interactive quizzes in real-time',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} ${merriweather.variable}`}>
        {children}
      </body>
    </html>
  );
}
