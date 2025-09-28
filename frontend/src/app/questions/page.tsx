'use client';

import { useState, useEffect } from 'react';
import QuestionsCreateForm from '@/components/questions/QuestionsCreateForm';
import QuestionsUpdateForm from '@/components/questions/QuestionsUpdateForm';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Question } from '@/types/question';

/**
 * @description This page displays a list of all the questions in the database.
 * It also provides buttons to create, update, and delete questions.
 * @returns A React component that renders a list of questions.
 * constants variables:
 * - `isCreateFormOpen`: boolean state variable indicating whether the create form is open or not.
 * - `isUpdateFormOpen`: boolean state variable indicating whether the update form is open or not.
 * - `selectedQuestion`: object representing the currently selected question for updating.
 * - `questions`: array of objects representing all the questions fetched from the API.
 * - `error`: string state variable containing any errors encountered during fetching questions.
 */
export default function CreateQuestionsPage() {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = async () => {
    try {
      setError(null);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/questions/`);
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
    setIsCreateFormOpen(false);
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/questions/${id}`,
        {
          method: 'DELETE',
        }
      );
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
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Question Manager</h1>
        <Button onClick={() => setIsCreateFormOpen(true)}>Create Question</Button>
      </div>
      <Separator className="my-4" />

      <div>{isCreateFormOpen && <QuestionsCreateForm onClose={handleCreateFormClose} />}</div>

      {isUpdateFormOpen && selectedQuestion && (
        <QuestionsUpdateForm question={selectedQuestion} onClose={handleUpdateFormClose} />
      )}

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      <div className="flex flex-col gap-4 mt-4">
        <TooltipProvider>
          {questions.map(question => (
            <div
              key={question.id}
              className="flex w-full flex-col items-start justify-between gap-4 rounded-md border p-4 sm:flex-row sm:items-center"
            >
              <div className="flex items-center gap-4">
                <Tooltip>
                  <TooltipTrigger>
                    <p className="text-sm font-medium leading-none">{question.question_text}</p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{question.explanation}</p>
                  </TooltipContent>
                </Tooltip>
                <Badge variant="outline">{question.type}</Badge>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleUpdate(question)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Update
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDelete(question.id)}
                    className="text-destructive"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
}
