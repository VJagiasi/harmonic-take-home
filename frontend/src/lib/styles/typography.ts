// Enhanced Typography System - Ramp/Notion/Uber Inspired
export const typography = {
  // Display hierarchy for maximum impact
  display:
    'text-6xl font-bold tracking-[-0.04em] leading-[0.9] lg:text-7xl font-display',
  displayMedium:
    'text-5xl font-bold tracking-[-0.03em] leading-[0.95] lg:text-6xl font-display',

  // Headlines with proper mobile-first scaling
  h1: 'text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-[-0.02em] leading-[1.1] font-display',
  h2: 'text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-semibold tracking-[-0.015em] leading-[1.15] font-display',
  h3: 'text-lg sm:text-xl lg:text-2xl xl:text-3xl font-semibold tracking-[-0.01em] leading-[1.2] font-display',
  h4: 'text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold tracking-[-0.005em] leading-[1.25] font-display',
  h5: 'text-sm sm:text-base lg:text-lg xl:text-xl font-semibold leading-[1.3] font-display',
  h6: 'text-sm sm:text-base lg:text-lg font-semibold leading-[1.35] font-display',

  // Body text with optimal mobile readability
  bodyLarge: 'text-base sm:text-lg leading-[1.6] font-normal text-gray-900',
  body: 'text-sm sm:text-base leading-[1.6] font-normal text-gray-900',
  bodyMedium: 'text-xs sm:text-sm leading-[1.5] font-normal text-gray-700',
  bodySmall: 'text-xs leading-[1.4] font-normal text-gray-600',

  // Supporting text
  caption: 'text-xs leading-[1.4] font-medium text-gray-500 tracking-[0.01em]',
  overline:
    'text-xs leading-[1.2] font-semibold text-gray-400 uppercase tracking-[0.08em]',

  // Interactive elements with touch-friendly sizing
  button: 'text-xs sm:text-sm font-medium leading-[1.2] tracking-[0.005em]',
  buttonLarge:
    'text-sm sm:text-base font-medium leading-[1.25] tracking-[0.005em]',
  link: 'text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 underline-offset-2 hover:underline transition-colors duration-150',
  label:
    'text-xs sm:text-sm font-medium leading-[1.2] text-gray-700 tracking-[0.01em]',

  // Special purpose
  mono: 'font-mono text-sm leading-[1.5] tracking-[0.02em] text-gray-800',
  code: 'font-mono text-xs leading-[1.4] tracking-[0.02em] text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded',

  // Data display with mobile optimization
  tableHeader:
    'text-xs font-semibold leading-[1.2] text-gray-500 uppercase tracking-[0.05em]',
  tableCell: 'text-xs sm:text-sm leading-[1.4] font-normal text-gray-900',
  number:
    'font-mono text-xs sm:text-sm leading-[1.4] font-medium text-gray-900 tabular-nums',
} as const;
