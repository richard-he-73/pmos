import React, { useRef, useCallback, useEffect, useState } from 'react';

export interface VirtualListProps {
  height: number;
  itemHeight: number;
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
}

export function VirtualList({
  height,
  itemHeight,
  items,
  renderItem,
  overscan = 3,
  className = '',
}: VirtualListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const totalHeight = items.length * itemHeight;

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + height) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex);

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  const containerStyle: React.CSSProperties = {
    height: `${height}px`,
    overflow: 'auto',
    position: 'relative',
  };

  const offsetY = startIndex * itemHeight;

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      onScroll={handleScroll}
      className={className}
    >
      <div
        style={{
          height: `${totalHeight}px`,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            transform: `translateY(${offsetY}px)`,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={`${startIndex + index}-${item.id || index}`}
              style={{ height: `${itemHeight}px` }}
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export interface LazyImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function LazyImage({
  src,
  alt,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzYzZkMCIvPjwvc3ZnPg==',
  className = '',
  style,
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && imgRef.current) {
            const img = new Image();
            img.src = src;
            img.onload = () => {
              setImageSrc(src);
              setIsLoading(false);
            };
            img.onerror = () => {
              setIsLoading(false);
            };
            observer.unobserve(imgRef.current);
          }
        });
      },
      {
        rootMargin: '50px',
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`${className} transition-opacity duration-300 ${
        isLoading ? 'opacity-50' : 'opacity-100'
      }`}
      style={style}
      loading="lazy"
    />
  );
}

export interface LazyListProps {
  items: any[];
  threshold?: number;
  loadMore?: () => void;
  hasMore?: boolean;
  renderItem: (item: any, index: number) => React.ReactNode;
  className?: string;
  loadingComponent?: React.ReactNode;
}

export function LazyList({
  items,
  threshold = 200,
  loadMore,
  hasMore = false,
  renderItem,
  className = '',
  loadingComponent = <div className="p-4 text-center text-gray-500">加载中...</div>,
}: LazyListProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (!loadMore || !hasMore) return;
      if (observerRef.current) observerRef.current.disconnect();
      
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            loadMore();
          }
        },
        {
          rootMargin: `${threshold}px`,
        }
      );
      
      if (node) observerRef.current.observe(node);
    },
    [loadMore, hasMore, threshold]
  );

  return (
    <div className={className}>
      {items.map((item, index) => (
        <div
          key={item.id || index}
          ref={index === items.length - 1 ? lastElementRef : null}
        >
          {renderItem(item, index)}
        </div>
      ))}
      {hasMore && loadingComponent}
    </div>
  );
}
