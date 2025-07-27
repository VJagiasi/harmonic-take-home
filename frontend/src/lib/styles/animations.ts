// Enhanced Animation System - Performance & Purpose Driven
export const animations = {
  // Purposeful transitions (avoid transition-all)
  transform:
    'transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
  opacity: 'transition-opacity duration-200 ease-out',
  colors: 'transition-colors duration-150 ease-out',
  shadow: 'transition-shadow duration-200 ease-out',
  size: 'transition-[width,height] duration-200 ease-out',

  // Timing variations
  fast: 'duration-150 ease-out',
  normal: 'duration-200 ease-out',
  slow: 'duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',

  // Micro-interactions (Uber-style)
  pressable: 'active:scale-[0.98] transition-transform duration-100 ease-out',
  lift: 'hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ease-out',
  glow: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-shadow duration-300',

  // Click animations
  clickPulse:
    'active:scale-[0.97] active:brightness-95 transition-all duration-75 ease-out',
  clickRipple:
    'relative overflow-hidden active:scale-[0.98] transition-transform duration-100 ease-out',
  clickGlow:
    'active:bg-blue-100/50 active:shadow-[inset_0_0_20px_rgba(59,130,246,0.2)] transition-all duration-150 ease-out',

  // Interactive states
  hoverSubtle: 'hover:bg-gray-50 transition-colors duration-150',
  hoverCard:
    'hover:shadow-md hover:border-gray-300 transition-all duration-200',
  hoverButton:
    'hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150',

  // Page transitions
  pageEnter:
    'animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out',
  pageExit: 'animate-out fade-out-0 slide-out-to-top-4 duration-300 ease-in',

  // Focus states (WCAG compliant)
  focus:
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
  focusInset:
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset',

  // Loading states
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  bounce: 'animate-bounce',

  // Drag and drop
  dragLift: 'shadow-xl scale-105 rotate-2 transition-all duration-200',
  dropHover: 'bg-blue-50 border-blue-200 transition-colors duration-150',
  dragHandle:
    'opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out',
  dragOverlay: 'shadow-2xl scale-110 rotate-1 bg-white/95 backdrop-blur-sm',
  dragPlaceholder:
    'bg-blue-50/30 border-2 border-dashed border-blue-300 transition-all duration-200',
} as const;
