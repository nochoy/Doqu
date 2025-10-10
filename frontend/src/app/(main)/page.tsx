'use client';

import { authenticatedFetch } from '@/lib/fetch-wrapper';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  // const router = useRouter();
  // const pathname = usePathname();
  // const { isAuthenticated } = useAuth();

  // useEffect(() => {
  //   const createQuiz = async () => {
  //     const quizInfo = {
  //       title: 'Test quiz title',
  //       description: 'Test quiz description',
  //       category: 'Science',
  //       difficulty: 1,
  //       is_public: true,
  //     };
  //     try {
  //       const response = await authenticatedFetch(
  //         `${process.env.NEXT_PUBLIC_API_URL}/api/quizzes/`,
  //         {
  //           method: 'POST',
  //           body: JSON.stringify(quizInfo),
  //           headers: {
  //             'Content-Type': 'application/json',
  //           },
  //         }
  //       );

  //       const result = await response.json();

  //       if (!response.ok) {
  //         throw new Error(result.detail || 'An error occurred creating quiz');
  //       }

  //       console.log('Created Quiz: ', result);
  //     } catch (err) {
  //       console.error('Create Quiz error: ', err);

  //       if (err instanceof Error && err.message === 'Unauthorized') {
  //         console.log('UNAUTHORIZED, redirecting to login page');
  //         // Redirect back to home page after successful login
  //         router.push(`/login?redirect=${pathname}`);
  //       }
  //     }
  //   };
  //   createQuiz();
  // }, [router, pathname, isAuthenticated]);

  return (
    <div className="container mx-auto pt-8">
      <header className='mb-8'>
        <h1 className='text-4xl font-bold'>Community Dashboard</h1>
        <p className='text-muted-foreground'>Explore quizzes created by the community</p>
      </header>

      <main className='space-y-6'>
        <section>
          <h2 className='text-2xl font-semibold mb-2'>Your Quizzes</h2>
          <div className='border rounded-lg bg-card text-card-foreground p-4'>
            List of quizzes if signed in
          </div>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-2'>Recent Activity</h2>
          <div className='border rounded-lg bg-card text-card-foreground p-4'>
            List of quizzes you recently played or hosted
          </div>
        </section>

        <section>
          <h2 className='text-2xl font-semibold mb-2'>Math</h2>
          <div className='border rounded-lg bg-card text-card-foreground p-4'>
            List of quizzes in Math category
          </div>
        </section>
      </main>
    </div>
  );
}
