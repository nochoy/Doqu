'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import QuestionsCreateForm from '@/components/questions/QuestionsCreateForm';
import QuestionsUpdateForm from '@/components/questions/QuestionsUpdateForm';
import QuizUpdateForm from '@/components/quiz/QuizUpdateForm';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Quiz } from '@/types/quiz';
import { authenticatedFetch } from '@/lib/fetch-wrapper';

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
  const searchParams = useSearchParams();
  const { userId } = useAuth();
  const quizId = searchParams.get('quizId');
  const ownerId = searchParams.get('ownerId');
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isQuestionUpdateFormOpen, setIsQuestionUpdateFormOpen] = useState(false);
  const [isQuizUpdateFormOpen, setIsQuizUpdateFormOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchQuizData = async () => {
    if (!quizId) return;
    try {
      setError(null);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quizzes/${quizId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch quiz data');
      }
      const data = await response.json();
      setQuiz(data);
      setQuestions(data.questions);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  useEffect(() => {
    fetchQuizData();
  }, [quizId]);

  const handleCreateFormClose = () => {
    setIsCreateFormOpen(false);
    fetchQuizData(); // Refetch questions after form is closed
  };

  const handleQuestionUpdateFormClose = () => {
    setIsQuestionUpdateFormOpen(false);
    setSelectedQuestion(null);
    fetchQuizData(); // Refetch questions after form is closed
  };

  const handleQuizUpdateFormClose = () => {
    setIsQuizUpdateFormOpen(false);
    fetchQuizData();
  };

  const handleUpdate = (question: Question) => {
    setSelectedQuestion(question);
    setIsQuestionUpdateFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/questions/${id}`,
        {
          method: 'DELETE',
        }
      );
      if (!response.ok) {
        throw new Error('Failed to delete question');
      }
      fetchQuizData();
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
        {/* <h1 className="text-2xl font-bold">{quiz ? quiz.title : 'Quiz'}</h1> */}
        <h1 className="text-2xl font-bold">{'Quiz Manager'}</h1>
        {ownerId === userId && (
          <div className="flex gap-2">
            {quiz && (
              <Button onClick={() => setIsQuizUpdateFormOpen(true)} disabled={!quizId}>
                Update Quiz
              </Button>
            )}
            <Button onClick={() => setIsCreateFormOpen(true)} disabled={!quizId}>
              Create Question
            </Button>
          </div>
        )}
      </div>
      {/* <Separator className="my-4 border-transparent bg-transparent" /> */}
      <Separator className="my-4" />

      {isQuizUpdateFormOpen && quiz && (
        <div className="my-4">
          <QuizUpdateForm quiz={quiz} onClose={handleQuizUpdateFormClose} />
        </div>
      )}

      {quiz && (
        <Card className="w-full mb-4 bg-transparent shadow-none">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{quiz.title || 'No description'}</CardTitle>
                <CardDescription>{quiz.description || 'No description'}</CardDescription>
              </div>
              {/* <Button onClick={() => setIsQuizUpdateFormOpen(true)} variant="link">
                Update
              </Button> */}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-semibold">Category</p>
                <p className="text-muted-foreground">{quiz.category || 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold">Difficulty</p>
                <p className="text-muted-foreground">{quiz.difficulty || 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold">Visibility</p>
                <p className="text-muted-foreground">{quiz.is_public ? 'Public' : 'Private'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        {isCreateFormOpen && quizId && (
          <QuestionsCreateForm onClose={handleCreateFormClose} quizId={quizId} />
        )}
      </div>

      {isQuestionUpdateFormOpen && selectedQuestion && (
        <QuestionsUpdateForm question={selectedQuestion} onClose={handleQuestionUpdateFormClose} />
      )}

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      <Separator className="my-4" />

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
              {ownerId === userId && (
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
              )}
            </div>
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
}
