"use client"

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { PlusSquareIcon } from '@phosphor-icons/react';

import { Button } from '@/components/ui/button';
import Logo from '@/components/shared/Logo';
import AccountDropdownMenu from '@/components/layout/navbar/AccountDropdownMenu';
import ThemeToggle from '@/components/layout/navbar/ThemeToggle';
import QuizCreateModal from '@/components/quiz/QuizCreateModal';
import QuizListModalLoadingFallback from '@/components/layout/navbar/QuizListModalLoadingFallback';

const LazyQuizListModal = dynamic(() => import('@/components/layout/navbar/QuizListModal'), {
  loading: () => <QuizListModalLoadingFallback/>,
  ssr: false,
})

export default function Navbar() {
  const [isCreateQuizFormOpen, setCreateQuizFormOpen] = useState(false);
  const [isQuizListModalOpen, setQuizListModalOpen] = useState(false);
  
    const handleOpenQuizListModal = () => {
      setQuizListModalOpen(true);
    }
  
    const handleCloseQuizListModal = () => {
      setQuizListModalOpen(false);
    }
  
  return (
    <header className="bg-sidebar text-sidebar-foreground border-sidebar-border p-2 px-4 border-b w-full">
      <nav className="flex justify-between items-center mx-auto">
        <Logo/>
        <div className="flex items-center gap-1">
          {/* Light/Dark Mode Toggle */}
          <ThemeToggle/>

          {/* Host Quiz Button */}
          <Button variant='ghost' onClick={handleOpenQuizListModal}>
            Host
          </Button>
          {isQuizListModalOpen &&
            <LazyQuizListModal isOpen={isQuizListModalOpen} onOpenChange={handleCloseQuizListModal}/>
          }

          {/* Join Room Button */}
          <Link href='/join'>
            <Button variant='ghost'>
              Join
            </Button>
          </Link>

          {/* Create Quiz Button */}
          <Button variant='default' onClick={() => setCreateQuizFormOpen(true)} className='mx-0 sm:mx-2'>
            <PlusSquareIcon/>
            Create
          </Button>
          {isCreateQuizFormOpen && 
            <QuizCreateModal onClose={() => setCreateQuizFormOpen(false)}/>
          }

          {/* Account Dropdown Menu */}
          <AccountDropdownMenu/>
        </div>
      </nav>
    </header>
  );
};
