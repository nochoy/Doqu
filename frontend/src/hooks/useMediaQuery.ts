"use client"

import { useEffect, useState } from "react"

/**
 * Custom hook to determine if the current window width is less than a specified width.
 *
 * @param width - The width threshold to determine if the device is mobile. Default is 640.
 * @returns {boolean} A boolean indicating if the current window width is less than the specified width.
 */
export const useMediaQuery = (width: number = 640): boolean => {
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Don't run on server
    setIsClient(true);
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < width);
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    }
  }, [width]);

  return isClient ? isMobile : false;
}

