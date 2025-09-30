"use client"

import { FormEvent, useEffect, useState, Fragment } from "react";

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { authenticatedFetch } from "@/lib/fetch-wrapper";
import { useAuth } from "@/hooks/useAuth";
import { QuizReadData } from "@/types/quiz";

interface QuizListProps {
  className?: string;
  quizzes: QuizReadData[];
  selectedQuiz?: string;
  onQuizSelect: (quizId: string) => void;
  isLoading: boolean;
}

function QuizList({ className, quizzes, selectedQuiz, onQuizSelect, isLoading }: QuizListProps) {

  const handleQuizClick = (quizId: string) => {
    if(selectedQuiz === quizId) {
      onQuizSelect('');
    } else {
      onQuizSelect(quizId);
    }
  }

  // quizzes = Array.from({ length: 100 }, (_, i) => ({ id: `${i}`, title: `Quiz${i}`}))

  if (isLoading) {
    return <div className="p-4 text-center text-muted-foreground">Loading quizzes...</div>
  }

  if (quizzes.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">No quizzes found. Create your first quiz!</div>
  }

  return (
    <>
      <ScrollArea className={cn('flex-1 overflow-auto', className)}>
        {quizzes.map((quiz) => (
          <Fragment key={quiz.id}>
            <div 
              onClick={() => handleQuizClick(quiz.id)}
              role='button'
              tabIndex={0}
              aria-pressed={selectedQuiz === quiz.id}
              className={`text-sm hover:bg-accent p-2 ${selectedQuiz === quiz.id ? 'bg-accent border-l-4 border-l-primary pl-1' : ''}`}
            >
              {quiz.title}
            </div>
            <Separator className=""/>
          </Fragment >
        ))}
      </ScrollArea>
    </>
  )
}


export default function QuizListModal() {
  const [openMobile, setOpenMobile] = useState<boolean>(false);
  const [openDesktop, setOpenDesktop] = useState<boolean>(false);
  const [selectedQuiz, setSelectedQuiz] = useState<string>('');
  const [userQuizzes, setUserQuizzes] = useState<QuizReadData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const { currentUser, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchUserQuizzes = async () => {
      if(!isAuthenticated || !currentUser?.id) {
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

        const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quizzes/?${params.toString()}`);
        const result = await response.json();

        if(!response.ok) {
          throw new Error(result.detail || "An error occurred fetching user's quizzes");
        }
        setUserQuizzes(result);
      } catch (err) {
        console.error("Error fetching user's quizzes: ", err);
        setUserQuizzes([]);
      } finally {
        setIsLoading(false);
      }
    }

    if (openMobile || openDesktop) {
      fetchUserQuizzes();
    } else {
      setUserQuizzes([]);
      setSelectedQuiz('');
    }
  }, [currentUser?.id, isAuthenticated, openMobile, openDesktop]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: Link to create room?
    setOpenMobile(false);
    setOpenDesktop(false);

    console.log("Selected quiz ID: ", selectedQuiz);
  }

  const handleMobileOpenChange = (isOpen: boolean) => {
    setOpenMobile(isOpen);
    if (!isOpen) setSelectedQuiz('');
  }

  const handleDesktopOpenChange = (isOpen: boolean) => {
    setOpenDesktop(isOpen);
    if (!isOpen) setSelectedQuiz('');
  }

  return (
    <>
      {/* Mobile Drawer */}
      <div className="block sm:hidden">
        <Drawer open={openMobile} onOpenChange={handleMobileOpenChange}>
          <DrawerTrigger asChild>
            <Button variant='ghost'>
              Host
            </Button>
          </DrawerTrigger>

          <DrawerContent className="max-h-3/4">
            <DrawerHeader>
              <DrawerTitle>Select a quiz</DrawerTitle>
              <DrawerDescription>Choose a quiz to host a game</DrawerDescription>
            </DrawerHeader>

            {/* Quiz List */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <QuizList 
                className='px-4'
                quizzes={userQuizzes}
                selectedQuiz={selectedQuiz}
                onQuizSelect={setSelectedQuiz}
                isLoading={isLoading}
              />

              {/* Buttons */}
              <DrawerFooter>
                <Button type='submit' disabled={!selectedQuiz}>
                  Select
                </Button>
                <DrawerClose asChild>
                  <Button variant='secondary'>
                    Cancel
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </form>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Desktop Dialog Popup */}
      <div className="hidden sm:block">
        <Dialog open={openDesktop} onOpenChange={handleDesktopOpenChange}>
          <DialogTrigger asChild>
            <Button variant='ghost'>
              Host
            </Button>
          </DialogTrigger>

          <DialogContent className="flex flex-col max-h-[50vh]">
            <DialogHeader>
              <DialogTitle>Select a quiz</DialogTitle>
              <DialogDescription>Choose a quiz from your collection to host a game</DialogDescription>
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
            <DialogFooter>
              <DialogClose asChild>
                <Button variant='secondary'>
                  Cancel
                </Button>
              </DialogClose>
              <Button type='submit' form='current-user-quizzes' disabled={!selectedQuiz}>
                Select
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}