/**
 * Design System Constants
 *
 * Centralized design tokens for spacing, typography, colors, and other design constants.
 * Use these throughout the application for consistency.
 */

// ============================================================================
// SPACING SYSTEM (8px base)
// ============================================================================
export const spacing = {
  xs: "4px", // 0.5 units
  sm: "8px", // 1 unit
  md: "16px", // 2 units
  lg: "24px", // 3 units
  xl: "32px", // 4 units
  xxl: "48px", // 6 units
  xxxl: "64px", // 8 units
} as const;

// ============================================================================
// TYPOGRAPHY SYSTEM
// ============================================================================
export const typography = {
  fontFamily: {
    primary:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"Fira Code", "Courier New", monospace',
  },
  fontSize: {
    xs: "12px",
    sm: "14px",
    md: "16px",
    lg: "18px",
    xl: "20px",
    xxl: "24px",
    xxxl: "32px",
    display: "40px",
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// ============================================================================
// BORDER RADIUS SYSTEM
// ============================================================================
export const borderRadius = {
  none: "0",
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  full: "9999px",
} as const;

// ============================================================================
// SHADOW SYSTEM
// ============================================================================
export const shadows = {
  none: "none",
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
} as const;

// ============================================================================
// Z-INDEX SYSTEM
// ============================================================================
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
} as const;

// ============================================================================
// TRANSITION SYSTEM
// ============================================================================
export const transitions = {
  fast: "150ms ease-in-out",
  normal: "250ms ease-in-out",
  slow: "350ms ease-in-out",
} as const;

// ============================================================================
// BREAKPOINTS (for media queries)
// ============================================================================
export const breakpoints = {
  xs: "480px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  xxl: "1536px",
} as const;

// ============================================================================
// COMPONENT SIZES
// ============================================================================
export const componentSizes = {
  button: {
    sm: { height: "32px", padding: "0 12px", fontSize: typography.fontSize.sm },
    md: { height: "40px", padding: "0 16px", fontSize: typography.fontSize.md },
    lg: { height: "48px", padding: "0 24px", fontSize: typography.fontSize.lg },
  },
  input: {
    sm: { height: "32px", padding: "0 12px", fontSize: typography.fontSize.sm },
    md: { height: "40px", padding: "0 16px", fontSize: typography.fontSize.md },
    lg: { height: "48px", padding: "0 20px", fontSize: typography.fontSize.lg },
  },
  card: {
    padding: {
      sm: spacing.md,
      md: spacing.lg,
      lg: spacing.xl,
    },
  },
} as const;

// ============================================================================
// LAYOUT CONSTANTS
// ============================================================================
export const layout = {
  maxWidth: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    full: "100%",
  },
  headerHeight: "64px",
  sidebarWidth: "280px",
} as const;

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================
export const animations = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  slideUp: {
    from: { transform: "translateY(10px)", opacity: 0 },
    to: { transform: "translateY(0)", opacity: 1 },
  },
  scale: {
    from: { transform: "scale(0.95)", opacity: 0 },
    to: { transform: "scale(1)", opacity: 1 },
  },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert spacing value to number (removes 'px')
 */
export const spacingValue = (key: keyof typeof spacing): number => {
  return parseInt(spacing[key], 10);
};

/**
 * Get color with alpha transparency
 */
export const withAlpha = (color: string, alpha: number): string => {
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
};

// ============================================================================
// EXPORT ALL
// ============================================================================
export const designSystem = {
  spacing,
  typography,
  borderRadius,
  shadows,
  zIndex,
  transitions,
  breakpoints,
  componentSizes,
  layout,
  animations,
} as const;

export type DesignSystem = typeof designSystem;
