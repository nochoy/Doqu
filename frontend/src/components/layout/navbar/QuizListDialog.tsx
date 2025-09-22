"use client"

import { useState } from "react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const quizzes = [
  { title: "Quiz1", id: "1" },
  { title: "Quiz2", id: "2" },
  { title: "Quiz3", id: "3" },
]

const handleSubmit = () => {
  console.log('Selected quiz', );
  
}

function QuizList() {
  // TODO: Get all quizzes owned by user
  return (
    <ScrollArea>
      Quiz List Goes Here
      <form onSubmit={handleSubmit}>
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="">
            {quiz.title}
            <Separator/>
          </div>
        ))}
        <div className='flex flex-row-reverse gap-2'>
          <Button>
            Select
          </Button>
          <Button variant='secondary'>
            Cancel
          </Button>
        </div>
      </form>
    </ScrollArea>
  )
}


export default function QuizListDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Drawer */}
      <div className="block sm:block">
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Button variant='ghost'>
              Hosty
            </Button>
          </DrawerTrigger>

          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Select a quiz</DrawerTitle>
              <DrawerDescription>Description</DrawerDescription>
            </DrawerHeader>

            {/* Quiz List */}
            <div className="px-4">
              <QuizList/>
            </div>

            <DrawerFooter>
              <DrawerClose asChild>
                <Button>
                  CLOSE here
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Desktop Dialog Popup */}
      <div className="hidden sm:block">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant='ghost'>
              Hoster
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select a quiz</DialogTitle>
              <DialogDescription>Description</DialogDescription>
            </DialogHeader>
            {/* Quiz List */}
            <QuizList/>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}