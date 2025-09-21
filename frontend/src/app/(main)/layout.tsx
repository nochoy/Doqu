import React from 'react';

import { Footer } from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';

export default function HomeLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <div className='flex flex-col min-h-screen'>
      <Navbar/>
      <main className='flex-grow'>
        {children}
      </main>
      <Footer/>
    </div>
  )
}