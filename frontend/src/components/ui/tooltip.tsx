'use client';

import * as React from 'react';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
}

export function Tooltip({ children, content }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: rect.right + 8,
      y: rect.top + rect.height / 2,
    });
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <>
      <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {children}
      </div>
      {isVisible && (
        <div
          className="fixed px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-xl whitespace-nowrap -translate-y-1/2 pointer-events-none"
          style={{
            left: position.x,
            top: position.y,
            zIndex: 999999,
          }}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </>
  );
}
