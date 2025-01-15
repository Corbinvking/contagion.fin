import { useState, useRef, useCallback } from 'react';

interface Position {
  x: number;
  y: number;
}

export const useDragNavigation = (initialOffset: Position = { x: 0, y: 0 }) => {
  const [offset, setOffset] = useState<Position>(initialOffset);
  const isDragging = useRef(false);
  const lastPosition = useRef<Position | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    lastPosition.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !lastPosition.current) return;

    const deltaX = e.clientX - lastPosition.current.x;
    const deltaY = e.clientY - lastPosition.current.y;

    setOffset(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));

    lastPosition.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    lastPosition.current = null;
  }, []);

  const resetOffset = useCallback(() => {
    setOffset({ x: 0, y: 0 });
  }, []);

  return {
    offset,
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseUp
    },
    resetOffset
  };
};