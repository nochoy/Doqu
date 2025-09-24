"use client"

import { useState } from 'react';
import Link from 'next/link';
import { PlusSquareIcon } from '@phosphor-icons/react';

import { Button } from '@/components/ui/button';
import Logo from '@/components/shared/Logo';
import AccountDropdownMenu from '@/components/layout/navbar/AccountDropdownMenu';
import QuizListDialog from '@/components/layout/navbar/QuizListDialog';
import ThemeToggle from '@/components/layout/navbar/ThemeToggle';
import QuizCreateModal from '@/components/quiz/QuizCreateModal';

export default function Navbar() {
  const [isCreateQuizFormOpen, setCreateQuizFormOpen] = useState(false);

  return (
    <header className="bg-sidebar text-sidebar-foreground border-sidebar-border p-2 px-4 border-b w-full">
      <nav className="flex justify-between items-center mx-auto">
        <Logo/>
        <div className="flex items-center gap-1">
          <ThemeToggle/>
          {/* Host Quiz Button */}
          <QuizListDialog/>
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
          {isCreateQuizFormOpen && <QuizCreateModal onClose={() => setCreateQuizFormOpen(false)}/>}
          {/* Account Dropdown Menu */}
          <AccountDropdownMenu/>
        </div>
      </nav>
    </header>
  );
};
