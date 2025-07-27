import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { animations } from '@/lib/constants';

interface ClickAnimationProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  variant?: 'pulse' | 'ripple' | 'glow' | 'scale';
}

export function ClickAnimation({
  children,
  className,
  onClick,
  disabled = false,
  variant = 'pulse',
}: ClickAnimationProps) {
  const [, setIsAnimating] = useState(false);
  const [ripples, setRipples] = useState<
    Array<{ x: number; y: number; id: number }>
  >([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return;

    setIsAnimating(true);

    // Create ripple effect for ripple variant
    if (variant === 'ripple' && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newRipple = {
        x,
        y,
        id: Date.now(),
      };

      setRipples(prev => [...prev, newRipple]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
      }, 600);
    }

    onClick?.(e);

    // Reset animation state
    setTimeout(() => setIsAnimating(false), 200);
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'pulse':
        return animations.clickPulse;
      case 'ripple':
        return cn(animations.clickRipple, 'relative overflow-hidden');
      case 'glow':
        return animations.clickGlow;
      case 'scale':
        return 'active:scale-[0.95] transition-transform duration-100 ease-out';
      default:
        return animations.clickPulse;
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'cursor-pointer select-none',
        getVariantClasses(),
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
      onClick={handleClick}
    >
      {children}

      {/* Ripple effects */}
      {variant === 'ripple' &&
        ripples.map(ripple => (
          <div
            key={ripple.id}
            className="absolute pointer-events-none"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
            }}
          >
            <div className="w-5 h-5 bg-blue-400/30 rounded-full animate-ping" />
          </div>
        ))}
    </div>
  );
}
