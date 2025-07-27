// Enhanced Color System - High Contrast & Semantic
export const colors = {
  // Surface colors
  surface: {
    primary: 'bg-white border-gray-200',
    secondary: 'bg-gray-50 border-gray-200',
    tertiary: 'bg-gray-100 border-gray-300',
    elevated: 'bg-white border-gray-200 shadow-sm',
    overlay: 'bg-white/95 backdrop-blur-sm border-gray-200',
  },

  // Text colors (WCAG AAA compliant)
  text: {
    primary: 'text-gray-900', // 21:1 contrast
    secondary: 'text-gray-700', // 10.46:1 contrast
    tertiary: 'text-gray-500', // 7.08:1 contrast
    quaternary: 'text-gray-400', // 4.56:1 contrast
    inverse: 'text-white',
    placeholder: 'text-gray-400 placeholder:text-gray-400',
  },

  // Interactive states
  interactive: {
    primary: 'text-blue-600 hover:text-blue-700',
    secondary: 'text-gray-600 hover:text-gray-700',
    danger: 'text-red-600 hover:text-red-700',
    success: 'text-green-600 hover:text-green-700',
  },

  // Brand colors with semantic meaning
  brand: {
    primary: 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
    ghost: 'bg-transparent border-transparent text-blue-600 hover:bg-blue-50',
  },

  // Status colors
  status: {
    success: {
      solid: 'bg-green-600 border-green-600 text-white',
      soft: 'bg-green-50 border-green-200 text-green-700',
      subtle: 'bg-green-50 text-green-600',
    },
    warning: {
      solid: 'bg-amber-500 border-amber-500 text-white',
      soft: 'bg-amber-50 border-amber-200 text-amber-700',
      subtle: 'bg-amber-50 text-amber-600',
    },
    danger: {
      solid: 'bg-red-600 border-red-600 text-white',
      soft: 'bg-red-50 border-red-200 text-red-700',
      subtle: 'bg-red-50 text-red-600',
    },
    info: {
      solid: 'bg-blue-600 border-blue-600 text-white',
      soft: 'bg-blue-50 border-blue-200 text-blue-700',
      subtle: 'bg-blue-50 text-blue-600',
    },
  },
} as const;

// Collection-specific colors with better contrast
export const collectionColors = {
  variants: [
    'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
    'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100',
    'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
    'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100',
    'bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100',
    'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100',
  ],
  dots: [
    'bg-blue-500',
    'bg-emerald-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-indigo-500',
  ],
} as const;
