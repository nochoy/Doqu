'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
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
import { Quiz } from '@/types/quiz';
import Link from 'next/link';
import { authenticatedFetch } from '@/lib/fetch-wrapper';

/**
 * @description This page displays a list of all the quizzes for the logged-in user.
 * It also provides buttons to create, view/update, and delete quizzes.
 * @returns A React component that renders a list of quizzes.
 */
export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { currentUser, userId } = useAuth();
  const searchParams = useSearchParams();
  const ownerId = searchParams.get('ownerId');

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setError(null);
        let url = `${process.env.NEXT_PUBLIC_API_URL}/api/quizzes/`;
        if (ownerId) {
          url += `?owner_id=${ownerId}`;
        }
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch quizzes');
        }
        let data = await response.json();
        if (!ownerId) {
          data = data.filter((quiz: Quiz) => quiz.is_public);
        }
        setQuizzes(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      }
    };

    fetchQuizzes();
  }, [currentUser, ownerId]);

  const handleDelete = async (id: string) => {
    try {
      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/quizzes/${id}`,
        {
          method: 'DELETE',
        }
      );
      if (!response.ok) {
        throw new Error('Failed to delete quiz');
      }
      setQuizzes(quizzes.filter(quiz => quiz.id !== id));
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
        <h1 className="text-2xl font-bold">Quiz Manager</h1>
      </div>
      <Separator className="my-4" />

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      <div className="flex flex-col gap-4 mt-4">
        <TooltipProvider>
          {quizzes.map(quiz => (
            <div
              key={quiz.id}
              className="flex w-full flex-col items-start justify-between gap-4 rounded-md border p-4 sm:flex-row sm:items-center"
            >
              <div className="flex items-center gap-4">
                <Tooltip>
                  <TooltipTrigger>
                    <p className="text-sm font-medium leading-none">{quiz.title}</p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{quiz.description || 'No description'}</p>
                  </TooltipContent>
                </Tooltip>
                <Badge variant="outline">{quiz.is_public ? 'Public' : 'Private'}</Badge>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <Link
                    href={`/questions?quizId=${quiz.id}${ownerId ? `&ownerId=${ownerId}` : ''}`}
                    passHref
                  >
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      View
                    </DropdownMenuItem>
                  </Link>
                  {quiz.owner_id === userId && (
                    <DropdownMenuItem
                      onClick={() => handleDelete(quiz.id)}
                      className="text-destructive"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
}
