import { useState, useEffect, useRef, useCallback } from 'react';

interface UseLazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  onLoad?: () => void;
}

export const useLazyLoad = (options: UseLazyLoadOptions = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const { threshold = 0.1, rootMargin = '100px', onLoad } = options;

  const callback = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        onLoad?.();
      }
    });
  }, [onLoad]);

  useEffect(() => {
    const observer = new IntersectionObserver(callback, {
      threshold,
      rootMargin,
    });

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [callback, threshold, rootMargin]);

  return { ref, isVisible };
};

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  onLoadMore: () => Promise<void>;
  threshold?: number;
  rootMargin?: string;
}

export const useInfiniteScroll = (options: UseInfiniteScrollOptions) => {
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const { hasMore, onLoadMore, threshold = 0.1, rootMargin = '100px' } = options;

  const callback = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && hasMore && !loading) {
        setLoading(true);
        onLoadMore().then(() => {
          setLoading(false);
        }).catch(() => {
          setLoading(false);
        });
      }
    });
  }, [hasMore, loading, onLoadMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(callback, {
      threshold,
      rootMargin,
    });

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [callback, threshold, rootMargin]);

  return { ref, loading };
};