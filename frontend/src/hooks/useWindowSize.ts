import { useState, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

interface Breakpoints {
  isMobile: boolean;
  isTabletPortrait: boolean;
  isTabletLandscape: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
}

interface UseWindowSizeReturn extends WindowSize {
  breakpoints: Breakpoints;
}

/**
 * Custom hook to track window dimensions with debouncing
 * Returns current window size and breakpoint helpers
 */
export function useWindowSize(): UseWindowSizeReturn {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    // Handler to call on window resize
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    
    function handleResize() {
      // Debounce resize events for better performance
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, 150); // 150ms debounce
    }

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty array ensures that effect is only run on mount

  // Calculate breakpoints based on Tailwind's defaults and our custom breakpoints
  const breakpoints: Breakpoints = {
    isMobile: windowSize.width < 641,
    isTabletPortrait: windowSize.width >= 641 && windowSize.width < 769,
    isTabletLandscape: windowSize.width >= 769 && windowSize.width < 1025,
    isDesktop: windowSize.width >= 1025 && windowSize.width < 1537,
    isLargeDesktop: windowSize.width >= 1537,
  };

  return {
    width: windowSize.width,
    height: windowSize.height,
    breakpoints,
  };
}

/**
 * Hook to detect if screen is below a certain width
 * Useful for conditional rendering based on screen size
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

