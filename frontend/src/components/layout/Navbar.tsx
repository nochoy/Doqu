"use client"

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { CaretUpIcon, ListIcon, PlusSquareIcon, UserCircleIcon } from '@phosphor-icons/react';

import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import Logo from '@/components/shared/Logo';
import AccountDropdownMenu from '@/components/layout/navbar/AccountDropdownMenu';
import ThemeToggle from '@/components/layout/navbar/ThemeToggle';
import QuizCreateModal from '@/components/quiz/QuizCreateModal';
import QuizListModalLoadingFallback from '@/components/layout/navbar/QuizListModalLoadingFallback';
import { useMediaQuery } from '@/hooks/useMediaQuery';


const LazyQuizListModal = dynamic(() => import('@/components/layout/navbar/QuizListModal'), {
  loading: () => <QuizListModalLoadingFallback/>,
  ssr: false,
})

export default function Navbar() {
  const [isCreateQuizFormOpen, setCreateQuizFormOpen] = useState(false);
  const [isQuizListModalOpen, setQuizListModalOpen] = useState(false);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isMobile = useMediaQuery();
  
    const handleOpenQuizListModal = () => {
      setQuizListModalOpen(true);
      setMobileSidebarOpen(false);
    }
  
    const handleCloseQuizListModal = () => {
      setQuizListModalOpen(false);
    }

    const HostQuizButton = (
      <>
        <Button variant='ghost' onClick={handleOpenQuizListModal}>
          Host
        </Button>
        {isQuizListModalOpen &&
          <LazyQuizListModal isOpen={isQuizListModalOpen} onOpenChange={handleCloseQuizListModal}/>
        }
      </>
    )

    const JoinRoomButton = (
      <Button variant='ghost'>
        <Link href='/join' className='w-full'>
            Join
        </Link>
      </Button>
    )

    const CreateQuizButton = (
      <>
        <Button variant='default' onClick={() => setCreateQuizFormOpen(true)} className='mx-0 sm:mx-2'>
          <PlusSquareIcon/>
          Create
        </Button>
        {isCreateQuizFormOpen && 
          <QuizCreateModal onClose={() => setCreateQuizFormOpen(false)}/>
        }
      </>
    )

    const MobileNavbar = (
      <nav className="flex items-center mx-auto relative h-10">
        <Sheet open={isMobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetTrigger>
              <ListIcon size={24}/>
              <span className='sr-only'>Toggle navigation menu</span>
          </SheetTrigger>

          <SheetContent side="left" className=''>
            <SheetHeader className="flex items-center">
              <Logo/>
            </SheetHeader>

            <div className='flex-1 flex flex-col px-3'>
              <ThemeToggle/>
              {HostQuizButton}
              {JoinRoomButton}
              {CreateQuizButton}
              <AccountDropdownMenu/>
            </div>

            <SheetFooter className='mt-auto'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost'>
                    <UserCircleIcon size={32}/>
                    Username
                    email
                    <CaretUpIcon className="ml-auto" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="end"
                  className="w-[--radix-popper-anchor-width]"
                >
                  <DropdownMenuItem>
                    <span>Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Billing</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        <Logo className='absolute left-1/2 transform -translate-x-1/2'/>
      </nav>
    )
  
  return (
    <header className="bg-sidebar text-sidebar-foreground border-sidebar-border p-2 border-b w-full">
      { isMobile ? (
        MobileNavbar
      ) : (
        // Desktop navbar
        <nav className="flex justify-between items-center mx-auto">
          <Logo/>
          <div className="flex items-center gap-1">
            <ThemeToggle/>
            {HostQuizButton}
            {JoinRoomButton}
            {CreateQuizButton}
            <AccountDropdownMenu/>
          </div>
        </nav>
      )}
    </header>
  );
};
