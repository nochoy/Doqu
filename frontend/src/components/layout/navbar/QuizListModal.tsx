'use client';

import { FormEvent, useEffect, useState, Fragment } from 'react';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { authenticatedFetch } from '@/lib/fetch-wrapper';
import { cn } from '@/lib/utils';
import { QuizReadData } from '@/types/quiz';
import { useAuth } from '@/hooks/useAuth';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface QuizListProps {
  className?: string;
  quizzes: QuizReadData[];
  selectedQuiz?: string;
  onQuizSelect: (quizId: string) => void;
  isLoading: boolean;
}

interface QuizListModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

function QuizList({ className, quizzes, selectedQuiz, onQuizSelect, isLoading }: QuizListProps) {
  const handleQuizClick = (quizId: string) => {
    if (selectedQuiz === quizId) {
      onQuizSelect('');
    } else {
      onQuizSelect(quizId);
    }
  };

  if (isLoading) {
    return (
      <div className={cn('w-full flex flex-col gap-2', className)}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-full" />
        ))}
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        No quizzes found. Create your first quiz!
      </div>
    );
  }

  return (
    <>
      <ScrollArea className={cn('flex-1 overflow-auto', className)}>
        {quizzes.map(quiz => (
          <Fragment key={quiz.id}>
            <div
              onClick={() => handleQuizClick(quiz.id)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleQuizClick(quiz.id);
                }
              }}
              role="button"
              tabIndex={0}
              aria-pressed={selectedQuiz === quiz.id}
              className={`text-sm hover:bg-accent p-2 ${selectedQuiz === quiz.id ? 'bg-accent border-l-4 border-l-primary pl-1' : ''}`}
            >
              {quiz.title}
            </div>
            <Separator />
          </Fragment>
        ))}
      </ScrollArea>
    </>
  );
}

export default function QuizListModal({ isOpen, onOpenChange }: QuizListModalProps) {
  const [selectedQuiz, setSelectedQuiz] = useState<string>('');
  const [userQuizzes, setUserQuizzes] = useState<QuizReadData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { currentUser, isAuthenticated } = useAuth();
  const isMobile = useMediaQuery();

  useEffect(() => {
    const fetchUserQuizzes = async () => {
      if (!isAuthenticated || !currentUser?.id) {
        setUserQuizzes([]);
        return;
      }

      try {
        console.log('fetching quizzes');
        setIsLoading(true);

        const params = new URLSearchParams({
          owner_id: currentUser.id,
          offset: '0',
          limit: '100',
        });

        const response = await authenticatedFetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/quizzes/?${params.toString()}`
        );
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.detail || "An error occurred fetching user's quizzes");
        }
        setUserQuizzes(result);
      } catch (err) {
        console.error("Error fetching user's quizzes: ", err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        setUserQuizzes([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchUserQuizzes();
    } else {
      setUserQuizzes([]);
      setSelectedQuiz('');
    }
  }, [currentUser?.id, isAuthenticated, isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: Link to create room?
    onOpenChange(false);
    setSelectedQuiz('');
    setError(null);

    console.log('Selected quiz ID: ', selectedQuiz);
  };

  const handleModalOpenChange = (newOpenState: boolean) => {
    onOpenChange(newOpenState);
    if (!newOpenState) {
      setSelectedQuiz('');
      setError(null);
    }
  };

  return (
    <>
      {/* Mobile Drawer */}
      {isMobile ? (
        <Drawer open={isOpen} onOpenChange={handleModalOpenChange}>
          <DrawerContent className="max-h-3/4">
            <DrawerHeader>
              <DrawerTitle>Select a quiz</DrawerTitle>
              <DrawerDescription>Choose a quiz to host a game</DrawerDescription>
            </DrawerHeader>

            {/* Quiz List */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <QuizList
                className="px-4"
                quizzes={userQuizzes}
                selectedQuiz={selectedQuiz}
                onQuizSelect={setSelectedQuiz}
                isLoading={isLoading}
              />
              <DrawerFooter>
                {/* Error message */}
                <div className="text-sm text-destructive">{error}</div>
                {/* Buttons */}
                <Button type="submit" disabled={!selectedQuiz}>
                  Select
                </Button>
                <DrawerClose asChild>
                  <Button variant="secondary">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </form>
          </DrawerContent>
        </Drawer>
      ) : (
        // Desktop Dialog
        <Dialog open={isOpen} onOpenChange={handleModalOpenChange}>
          <DialogContent className="flex flex-col max-h-[50vh]">
            <DialogHeader>
              <DialogTitle>Select a quiz</DialogTitle>
              <DialogDescription>
                Choose a quiz from your collection to host a game
              </DialogDescription>
            </DialogHeader>

            {/* Quiz List */}
            <form onSubmit={handleSubmit} id="current-user-quizzes" className="flex min-h-0">
              <QuizList
                selectedQuiz={selectedQuiz}
                onQuizSelect={setSelectedQuiz}
                quizzes={userQuizzes}
                isLoading={isLoading}
              />
            </form>
            <DialogFooter className="flex flex-row sm:justify-between items-center">
              {/* Error message */}
              <div className="text-sm text-destructive">{error}</div>
              {/* Buttons */}
              <div className="flex gap-2">
                <DialogClose asChild>
                  <Button variant="secondary" className="">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  form="current-user-quizzes"
                  disabled={!selectedQuiz}
                  className="flex-0"
                >
                  Select
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
