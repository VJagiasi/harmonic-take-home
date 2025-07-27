import { useState, useCallback } from 'react';

export interface DragAnimationState {
  isDragging: boolean;
  draggedItemId: string | null;
  dragOffsetY: number;
}

export function useDragAnimation() {
  const [animationState, setAnimationState] = useState<DragAnimationState>({
    isDragging: false,
    draggedItemId: null,
    dragOffsetY: 0,
  });

  const startDrag = useCallback((itemId: string) => {
    setAnimationState({
      isDragging: true,
      draggedItemId: itemId,
      dragOffsetY: 0,
    });
  }, []);

  const updateDragOffset = useCallback((offsetY: number) => {
    setAnimationState(prev => ({
      ...prev,
      dragOffsetY: offsetY,
    }));
  }, []);

  const endDrag = useCallback(() => {
    setAnimationState({
      isDragging: false,
      draggedItemId: null,
      dragOffsetY: 0,
    });
  }, []);

  const getDragStyles = useCallback(
    (itemId: string) => {
      if (
        animationState.draggedItemId === itemId &&
        animationState.isDragging
      ) {
        return {
          transform: `translateY(${animationState.dragOffsetY}px)`,
          zIndex: 1000,
          opacity: 0.8,
          scale: 1.02,
        };
      }
      return {};
    },
    [animationState]
  );

  const getDropZoneStyles = useCallback(
    (isOver: boolean, position: 'above' | 'below') => {
      if (!isOver) return {};

      return {
        borderColor: '#3b82f6',
        borderWidth: position === 'above' ? '2px 0 0 0' : '0 0 2px 0',
        borderStyle: 'solid',
      };
    },
    []
  );

  return {
    animationState,
    startDrag,
    updateDragOffset,
    endDrag,
    getDragStyles,
    getDropZoneStyles,
  };
}
