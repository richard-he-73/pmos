import { useState, useRef, useCallback, useEffect } from 'react';

interface VirtualScrollProps<T> {
  data: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  containerHeight?: number;
  className?: string;
}

const VirtualScroll = <T extends unknown>({
  data,
  itemHeight,
  renderItem,
  containerHeight = 400,
  className = '',
}: VirtualScrollProps<T>) => {
  const [startIndex, setStartIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalItems = data.length;
  const totalHeight = totalItems * itemHeight;
  const visibleItems = Math.ceil(containerHeight / itemHeight);
  const endIndex = Math.min(startIndex + visibleItems + 2, totalItems);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    const scrollTop = containerRef.current.scrollTop;
    const newStartIndex = Math.floor(scrollTop / itemHeight);
    setStartIndex(Math.max(0, newStartIndex - 1));
  }, [itemHeight]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const visibleData = data.slice(startIndex, endIndex);

  return (
    <div
      ref={containerRef}
      className={`virtual-scroll ${className}`}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
      }}
    >
      <div
        className="virtual-scroll-placeholder"
        style={{
          height: totalHeight,
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />
      <div
        className="virtual-scroll-content"
        style={{
          position: 'relative',
          top: startIndex * itemHeight,
        }}
      >
        {visibleData.map((item, idx) => (
          <div
            key={`${startIndex}-${idx}`}
            style={{ height: itemHeight }}
          >
            {renderItem(item, startIndex + idx)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VirtualScroll;