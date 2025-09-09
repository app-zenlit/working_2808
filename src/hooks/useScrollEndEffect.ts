import { useEffect, useRef, RefObject } from 'react';

interface UseScrollEndEffectOptions {
  onScrollEnd: () => void;
  onScrollUp: () => void;
  offset?: number; // Distance from bottom to trigger effect
  throttleMs?: number; // Throttle scroll events
}

export const useScrollEndEffect = (
  scrollRef: RefObject<HTMLElement>,
  options: UseScrollEndEffectOptions
) => {
  const {
    onScrollEnd,
    onScrollUp,
    offset = 50,
    throttleMs = 100
  } = options;

  const lastScrollTop = useRef(0);
  const throttleTimer = useRef<NodeJS.Timeout | null>(null);
  const isAtBottom = useRef(false);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const handleScroll = () => {
      // Clear existing throttle timer
      if (throttleTimer.current) {
        clearTimeout(throttleTimer.current);
      }

      // Throttle scroll events
      throttleTimer.current = setTimeout(() => {
        const scrollTop = element.scrollTop;
        const scrollHeight = element.scrollHeight;
        const clientHeight = element.clientHeight;
        
        // Calculate if we're near the bottom
        const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
        const nearBottom = distanceFromBottom <= offset;
        
        // Determine scroll direction
        const scrollingDown = scrollTop > lastScrollTop.current;
        const scrollingUp = scrollTop < lastScrollTop.current;
        
        // Trigger effects based on position and direction
        if (nearBottom && scrollingDown && !isAtBottom.current) {
          isAtBottom.current = true;
          onScrollEnd();
        } else if (!nearBottom && scrollingUp && isAtBottom.current) {
          isAtBottom.current = false;
          onScrollUp();
        }
        
        lastScrollTop.current = scrollTop;
      }, throttleMs);
    };

    // Add scroll listener
    element.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => {
      element.removeEventListener('scroll', handleScroll);
      if (throttleTimer.current) {
        clearTimeout(throttleTimer.current);
      }
    };
  }, [scrollRef, onScrollEnd, onScrollUp, offset, throttleMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (throttleTimer.current) {
        clearTimeout(throttleTimer.current);
      }
    };
  }, []);
};