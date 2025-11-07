/**
 * MOMENTUM APP - DESIGN SYSTEM TOKENS
 *
 * Professional design system for consistent UI/UX across all components.
 * Based on research-backed principles for habit/wellness applications.
 *
 * Usage: Import these tokens in all frontend components for consistency.
 */

export const DESIGN_TOKENS = {
  /**
   * COLOR PALETTE
   * Sky blue primary (clarity, trust), green success (achievement)
   */
  colors: {
    // Primary brand color
    primary: '#0EA5E9',        // Sky blue - clarity, trust, calm
    primaryHover: '#0284C7',   // Darker on hover
    primaryLight: '#7DD3FC',   // Light tint

    // Success states
    success: '#22C55E',        // Green - achievement, completion
    successHover: '#16A34A',
    successLight: '#86EFAC',

    // Warning states
    warning: '#EAB308',        // Amber - caution, attention needed
    warningHover: '#CA8A04',
    warningLight: '#FDE047',

    // Danger/Error states
    danger: '#EF4444',         // Red - critical, error
    dangerHover: '#DC2626',
    dangerLight: '#FCA5A5',

    // Neutral grays
    neutral: {
      50: '#F9FAFB',   // Lightest background
      100: '#F3F4F6',  // Light background
      200: '#E5E7EB',  // Borders
      300: '#D1D5DB',  // Disabled text
      400: '#9CA3AF',  // Placeholder text
      500: '#6B7280',  // Secondary text
      600: '#4B5563',  // Body text
      700: '#374151',  // Emphasis text
      800: '#1F2937',  // Strong emphasis
      900: '#111827',  // Heading text
    },

    // Zone-specific colors (from existing system)
    zones: {
      social: '#3B82F6',       // Blue - social connection
      physical: '#10B981',     // Green - physical vitality
      professional: '#8B5CF6', // Purple - professional growth
      emotional: '#F59E0B',    // Orange - emotional awareness
    },

    // Semantic colors
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      disabled: '#D1D5DB',
      inverse: '#FFFFFF',
    },
  },

  /**
   * TYPOGRAPHY
   * Readable, accessible font sizes with optimal line heights
   */
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace',
    },

    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px (mobile minimum)
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
    },

    lineHeight: {
      tight: '1.2',    // Headings
      snug: '1.3',     // Subheadings
      normal: '1.5',   // Body text minimum
      relaxed: '1.6',  // Body text optimal
      loose: '1.8',    // Long-form content
    },

    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },

    // Pre-configured text styles
    styles: {
      h1: {
        fontSize: '3rem',      // 48px
        lineHeight: '1.2',
        fontWeight: 700,
      },
      h2: {
        fontSize: '2rem',      // 32px
        lineHeight: '1.3',
        fontWeight: 700,
      },
      h3: {
        fontSize: '1.5rem',    // 24px
        lineHeight: '1.4',
        fontWeight: 600,
      },
      body: {
        fontSize: '1rem',      // 16px
        lineHeight: '1.6',
        fontWeight: 400,
      },
      small: {
        fontSize: '0.875rem',  // 14px
        lineHeight: '1.6',
        fontWeight: 400,
      },
    },
  },

  /**
   * SPACING
   * 8px scale for consistent rhythm and visual hierarchy
   */
  spacing: {
    0: '0',
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '2.5rem', // 40px
    '3xl': '3rem',   // 48px
    '4xl': '4rem',   // 64px
    '5xl': '5rem',   // 80px
  },

  /**
   * BORDER RADIUS
   * Consistent rounding for buttons, cards, inputs
   */
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    base: '0.5rem',  // 8px (default)
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px
    xl: '1.5rem',    // 24px
    full: '9999px',  // Fully rounded (pills)
  },

  /**
   * SHADOWS
   * Subtle depth for elevation and focus states
   */
  shadows: {
    none: 'none',
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    base: '0 2px 4px rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
  },

  /**
   * TRANSITIONS
   * Smooth, natural animations
   */
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',

    // Specific property transitions
    colors: 'color 200ms ease-in-out, background-color 200ms ease-in-out, border-color 200ms ease-in-out',
    opacity: 'opacity 200ms ease-in-out',
    transform: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    all: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  /**
   * BREAKPOINTS
   * Mobile-first responsive design
   */
  breakpoints: {
    xs: '0px',       // Mobile (default)
    sm: '640px',     // Large mobile / small tablet
    md: '768px',     // Tablet
    lg: '1024px',    // Desktop
    xl: '1280px',    // Large desktop
    '2xl': '1536px', // Extra large desktop
  },

  /**
   * Z-INDEX LAYERS
   * Consistent stacking context
   */
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },

  /**
   * COMPONENT-SPECIFIC TOKENS
   */
  components: {
    /**
     * Button specifications
     */
    button: {
      // Minimum touch target (mobile accessibility)
      minHeight: '44px',
      minWidth: '44px',

      // Padding
      paddingX: {
        sm: '0.75rem',  // 12px
        base: '1rem',   // 16px
        lg: '1.5rem',   // 24px
      },
      paddingY: {
        sm: '0.5rem',   // 8px
        base: '0.75rem', // 12px
        lg: '1rem',     // 16px
      },
    },

    /**
     * Input specifications
     */
    input: {
      // Minimum touch target
      minHeight: '44px',

      // Padding
      paddingX: '0.75rem', // 12px
      paddingY: '0.75rem', // 12px

      // Border
      borderWidth: '1px',
      borderColor: '#E5E7EB',
      borderColorFocus: '#0EA5E9',

      // Border radius
      borderRadius: '0.5rem', // 8px
    },

    /**
     * Card specifications
     */
    card: {
      padding: '1.5rem',      // 24px
      borderRadius: '0.75rem', // 12px
      shadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      background: '#FFFFFF',
    },
  },

  /**
   * ANIMATION DURATIONS
   * For consistent motion design
   */
  animation: {
    fast: 150,
    base: 200,
    slow: 300,
    slower: 500,
    slowest: 1000,
  },
} as const;

/**
 * HELPER TYPES
 * TypeScript types for design tokens
 */
export type ColorToken = keyof typeof DESIGN_TOKENS.colors |
  keyof typeof DESIGN_TOKENS.colors.neutral |
  keyof typeof DESIGN_TOKENS.colors.zones;

export type SpacingToken = keyof typeof DESIGN_TOKENS.spacing;
export type FontSizeToken = keyof typeof DESIGN_TOKENS.typography.fontSize;
export type FontWeightToken = keyof typeof DESIGN_TOKENS.typography.fontWeight;
export type BreakpointToken = keyof typeof DESIGN_TOKENS.breakpoints;

/**
 * USAGE EXAMPLES:
 *
 * Import in React components:
 * ```tsx
 * import { DESIGN_TOKENS } from '@momentum/shared/design-tokens';
 *
 * const Button = styled.button`
 *   background-color: ${DESIGN_TOKENS.colors.primary};
 *   padding: ${DESIGN_TOKENS.spacing.md};
 *   border-radius: ${DESIGN_TOKENS.borderRadius.base};
 *   min-height: ${DESIGN_TOKENS.components.button.minHeight};
 * `;
 * ```
 *
 * Use in Tailwind config:
 * ```js
 * module.exports = {
 *   theme: {
 *     extend: {
 *       colors: DESIGN_TOKENS.colors,
 *       spacing: DESIGN_TOKENS.spacing,
 *     }
 *   }
 * }
 * ```
 */

export default DESIGN_TOKENS;
