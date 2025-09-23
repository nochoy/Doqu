"use client"

import { FormEvent, useState } from "react";

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// TODO: Get all quizzes owned by user
const quizzes = Array.from({ length: 100 }, (_, i) => ({ id: `${i}`, title: `Quiz${i}`}))

interface QuizListProps {
  className?: string;
  selectedQuiz?: string;
  onQuizSelect: (quizId: string) => void;
}

function QuizList({ className, selectedQuiz, onQuizSelect }: QuizListProps) {
  const handleQuizClick = (quizId: string) => {
    if(selectedQuiz === quizId) {
      onQuizSelect('');
    } else {
      onQuizSelect(quizId);
    }
  }

  return (
    <ScrollArea className={cn('flex-1 overflow-auto', className)}>
        {quizzes.map((quiz) => (
          <>
            <div 
              key={quiz.id}
              onClick={() => handleQuizClick(quiz.id)}
              role='button'
              tabIndex={0}
              aria-pressed={selectedQuiz === quiz.id}
              className={`text-sm hover:bg-accent p-2 ${selectedQuiz === quiz.id ? 'bg-accent border-l-4 border-l-primary pl-1' : ''}`}
            >
              {quiz.title}
            </div>
            <Separator className=""/>
          </>
        ))}
    </ScrollArea>
  )
}


export default function QuizListDialog() {
  const [openMobile, setOpenMobile] = useState<boolean>(false);
  const [openDesktop, setOpenDesktop] = useState<boolean>(false);
  const [selectedQuiz, setSelectedQuiz] = useState<string>('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: Link to create room?
    setOpenMobile(false);
    setOpenDesktop(false);

    console.log("Selected quiz ID: ", selectedQuiz);
  }

  const handleMobileOpenChange = (isOpen: boolean) => {
    setOpenMobile(isOpen);
    setSelectedQuiz('');
  }

  const handleDesktopOpenChange = (isOpen: boolean) => {
    setOpenDesktop(isOpen);
    setSelectedQuiz('');
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
              <DrawerDescription>Description</DrawerDescription>
            </DrawerHeader>

            {/* Quiz List */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <QuizList 
                className='px-4' 
                selectedQuiz={selectedQuiz}
                onQuizSelect={setSelectedQuiz}
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

          <DialogContent className="h-1/2">
            <DialogHeader>
              <DialogTitle>Select a quiz</DialogTitle>
              <DialogDescription>Description</DialogDescription>
            </DialogHeader>

            {/* Quiz List */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <QuizList 
                selectedQuiz={selectedQuiz}
                onQuizSelect={setSelectedQuiz}
              />

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant='secondary'>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type='submit' disabled={!selectedQuiz}>
                  Select
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}