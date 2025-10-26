'use client';

import React from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';

export default function QuizModalLoadingFallback() {
  const isMobile = useMediaQuery();

  if (isMobile) {
    // Mobile Loading
    return (
      <>
        <span className="fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <div className="fixed inset-x-0 bottom-0 z-50 flex h-1/3 flex-col rounded-t-[10px] border bg-background p-6">
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <Spinner />
            <p className="text-sm text-muted-foreground">Loading quizzes...</p>
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-9 w-full" />
            ))}
          </div>
        </div>
      </>
    );
  } else {
    // Desktop Loading
    return (
      <>
        <span className="fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-background p-6 shadow-lg duration-200 sm:rounded-lg md:w-full max-h-[50vh] flex flex-col min-h-0">
          <div className="flex flex-col items-center justify-center h-auto gap-2">
            <Spinner />
            <p className="text-sm text-muted-foreground">Loading quizzes...</p>
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-9 w-full" />
            ))}
          </div>
        </div>
      </>
    );
  }
}
