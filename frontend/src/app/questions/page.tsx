'use client';

import { useState, useEffect } from 'react';
import QuestionsCreateForm from '@/components/questions/QuestionsCreateForm';
import QuestionsUpdateForm from '@/components/questions/QuestionsUpdateForm';

interface Question {
  id: string;
  question_text: string;
  type: "MC" | "TF" | "SM";
  time_limit: number;
  explanation: string;
  correct_answer: Record<string, any>;
  possible_answers: Record<string, any>;
}

export default function CreateQuestionsPage() {
  const [isCreateFormOpen, setisCreateFormOpen] = useState(false);
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = async () => {
    try {
      setError(null);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/questions/all`);
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      const data = await response.json();
      setQuestions(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleCreateFormClose = () => {
    setisCreateFormOpen(false);
    fetchQuestions(); // Refetch questions after form is closed
  };

  const handleUpdateFormClose = () => {
    setIsUpdateFormOpen(false);
    setSelectedQuestion(null);
    fetchQuestions(); // Refetch questions after form is closed
  };

  const handleUpdate = (question: Question) => {
    setSelectedQuestion(question);
    setIsUpdateFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/questions/remove/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete question');
      }
      fetchQuestions();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  return (
    <main className="container mx-auto p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-6">Manage Questions</h1>
        <button
            onClick={() => setisCreateFormOpen(true)}
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-3 px-6 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
        >
            Create New Question
        </button>
      </div>

      {isCreateFormOpen && (
          <QuestionsCreateForm onClose={handleCreateFormClose} />
      )}

      {isUpdateFormOpen && selectedQuestion && (
        <QuestionsUpdateForm 
          question={selectedQuestion}
          onClose={handleUpdateFormClose} 
        />
      )}

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Questions List</h2>
        {error && <p className="text-red-500">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {questions.map((question) => (
            <div key={question.id} className="p-4 border rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-2">{question.question_text}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleUpdate(question)}
                  className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                >
                  Update
                </button>
                <button
                  onClick={() => handleDelete(question.id)}
                  className="inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
