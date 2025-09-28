'use client';

import { FormData, Question } from '@/types/question';
import QuestionForm from './QuestionForm';

interface QuestionsUpdateFormProps {
  question: Question;
  onClose: () => void;
}

export default function QuestionsUpdateForm({ question, onClose }: QuestionsUpdateFormProps) {
  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/questions/${question.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update question. Please try again');
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
      initialData={question}
      onSubmit={onSubmit}
      onClose={onClose}
      buttonText="Update"
      title="Update Question"
      description="Update the details of an existing question."
    />
  );
}
