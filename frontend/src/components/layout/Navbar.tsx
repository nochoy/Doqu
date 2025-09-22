"use client"

import React from 'react';
import Link from 'next/link';
import { PlusSquareIcon } from '@phosphor-icons/react';

import { Button } from '@/components/ui/button';
import AccountDropdownMenu from './navbar/AccountDropdownMenu';
import QuizListDialog from './navbar/QuizListDialog';

export default function Navbar() {

  return (
    <header className="bg-sidebar text-sidebar-foreground border-sidebar-border p-3 px-8 border-b w-full">
      <nav className="flex justify-between items-center mx-auto">
        <div>Logo</div>
        <div className="flex items-center gap-1">
          <Button variant='ghost'>
            Host
          </Button>
          <QuizListDialog/>
          <Link href='/join'>
            <Button variant='ghost'>
              Join
            </Button>
          </Link>
          <Button variant='default' className='mx-0 sm:mx-2'>
            <PlusSquareIcon/>
            Create
          </Button>
          <AccountDropdownMenu/>
        </div>
      </nav>
    </header>
  );
};
