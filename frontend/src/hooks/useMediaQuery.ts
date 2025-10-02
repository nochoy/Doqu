"use client"

import { useEffect, useState } from "react"

/**
 * Custom hook to determine if the current viewport width is considered mobile.
 *
 * This hook sets up a resize event listener to check if the window's inner width
 * is less than 640 pixels, which is considered a mobile view (Tailwind's 'sm' breakpoint)
 *
 * @returns {boolean} - True if the viewport width is less than 640 pixels, false otherwise.
 */
export const useMediaQuery = (): boolean => {
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Don't run on server
    setIsClient(true);
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    }
  }, []);

  return isClient ? isMobile : false;
}

