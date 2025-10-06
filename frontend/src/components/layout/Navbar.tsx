"use client"

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ApplePodcastsLogoIcon, ListIcon, PlusSquareIcon, UsersIcon } from '@phosphor-icons/react';

import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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
    }
  
    const handleCloseQuizListModal = () => {
      setQuizListModalOpen(false);
    }

    const HostQuizButton = (
      <>
        <Button 
          variant='ghost' 
          onClick={handleOpenQuizListModal} 
          className={isMobile ? 'justify-start' : ''}
        >
          {isMobile && <ApplePodcastsLogoIcon size={20}/>}
          Host
        </Button>
        {isQuizListModalOpen &&
          <LazyQuizListModal isOpen={isQuizListModalOpen} onOpenChange={handleCloseQuizListModal}/>
        }
      </>
    )

    const JoinRoomButton = (
      <Link href='/join'>
        <Button variant='ghost' className={isMobile ? 'justify-start w-full' : ''}>
            {isMobile && <UsersIcon size={20}/>}
            Join
        </Button>
      </Link>
    )

    const CreateQuizButton = (
      <>
        <Button variant='default' onClick={() => setCreateQuizFormOpen(true)} className='mx-0 sm:mx-2'>
          <PlusSquareIcon size={18}/>
          Create
        </Button>
        {isCreateQuizFormOpen && 
          <QuizCreateModal onClose={() => setCreateQuizFormOpen(false)}/>
        }
      </>
    )
  
  return (
    <header className="bg-sidebar text-sidebar-foreground border-sidebar-border p-2 border-b w-full">
      { isMobile ? ( // Mobile Navbar
        <nav className="flex items-center mx-auto relative h-10">
        <Sheet open={isMobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetTrigger>
            <ListIcon size={24}/>
            <span className='sr-only'>Toggle navigation menu</span>
          </SheetTrigger>

          {/* Side drawer */}
          <SheetContent side="left" xCloseButton={false} className='flex flex-col gap-2'>
            <SheetHeader className="flex flex-row items-center justify-center relative">
              <SheetTitle className='h-8'>
                <Logo/>
              </SheetTitle>
              <ThemeToggle className='absolute right-0 scale-90'/>
            </SheetHeader>

            {/* Buttons */}
            <div className='flex-1 flex flex-col px-3 gap-4'>
              {CreateQuizButton}
              <div className='flex flex-col'>
                {HostQuizButton}
                {JoinRoomButton}
              </div>
            </div>

            <SheetFooter className='mt-auto'>
              <AccountDropdownMenu/>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        <Logo className='absolute left-1/2 transform -translate-x-1/2'/>
      </nav>
      ) : ( // Desktop navbar
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
