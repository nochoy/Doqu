'use client';

import { useState } from 'react';
import QuizCreateModal from '@/components/quiz/QuizCreateModal';

export default function CreateQuizPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <main className="container mx-auto p-8 text-center">
      <h1 className="text-3xl font-bold mb-6">Your Quizzes</h1>
      <p className="text-gray-600 mb-8">Create and manage your quizzes here.</p>

      <button
        onClick={() => setIsFormOpen(true)}
        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-3 px-6 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
      >
        Create New Quiz
      </button>
      {isFormOpen && <QuizCreateModal onClose={() => setIsFormOpen(false)} />}
    </main>
  );
}
