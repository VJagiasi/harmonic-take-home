// Enhanced Spacing System - Responsive & Purposeful
export const spacing = {
  // Responsive containers with reading optimization
  container: {
    xs: 'max-w-sm mx-auto px-3 sm:px-4', // Mobile-first
    sm: 'max-w-3xl mx-auto px-3 sm:px-4 lg:px-6', // Reading width
    md: 'max-w-5xl mx-auto px-3 sm:px-4 lg:px-6', // Content width
    lg: 'max-w-6xl mx-auto px-3 sm:px-4 lg:px-6', // Data tables
    xl: 'max-w-7xl mx-auto px-3 sm:px-4 lg:px-6', // Full width
    full: 'w-full px-3 sm:px-4 lg:px-6 xl:px-8', // Edge-to-edge
  },

  // Component density variants with responsive scaling
  density: {
    compact: {
      padding: 'p-2 sm:p-3',
      gap: 'gap-1 sm:gap-2',
      space: 'space-y-1 sm:space-y-2',
    },
    comfortable: {
      padding: 'p-3 sm:p-4',
      gap: 'gap-2 sm:gap-3',
      space: 'space-y-2 sm:space-y-3',
    },
    spacious: {
      padding: 'p-4 sm:p-6',
      gap: 'gap-3 sm:gap-4',
      space: 'space-y-3 sm:space-y-4',
    },
  },

  // Semantic spacing with mobile optimization
  section: 'space-y-6 sm:space-y-8 lg:space-y-12',
  card: 'p-4 sm:p-6 lg:p-8',

  // Mobile-specific utilities
  mobile: {
    padding: 'p-3 sm:p-4',
    margin: 'm-3 sm:m-4',
    gap: 'gap-2 sm:gap-3',
    touch: 'min-h-[44px]', // Apple's recommended touch target
  },

  // Stack spacing with responsive scaling
  stack: {
    xs: 'space-y-1 sm:space-y-2',
    sm: 'space-y-2 sm:space-y-3',
    md: 'space-y-3 sm:space-y-4',
    lg: 'space-y-4 sm:space-y-6',
    xl: 'space-y-6 sm:space-y-8',
    xxl: 'space-y-8 sm:space-y-12',
  },

  // Responsive grid spacing
  grid: {
    xs: 'gap-2 sm:gap-3',
    sm: 'gap-3 sm:gap-4',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8',
  },
} as const;
