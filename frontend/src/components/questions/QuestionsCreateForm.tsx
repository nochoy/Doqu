'use client';

import { FormData } from '@/types/question';
import QuestionForm from './QuestionForm';

interface QuestionsCreateFormProps {
  onClose: () => void;
}

export default function QuestionsCreateForm({ onClose }: QuestionsCreateFormProps) {
  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/questions/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create question. Please try again');
      }

      await response.json();
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error('An unknown error occurred');
      }
    }
  };

  return (
    <QuestionForm
      onSubmit={onSubmit}
      onClose={onClose}
      buttonText="Create"
      title="New Question"
      description="Create a new question to add to the question bank."
    />
  );
}
