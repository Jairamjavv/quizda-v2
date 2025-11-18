import { createTheme, alpha } from "@mui/material/styles";
import type { DesignTokens } from "./designTokens";

/**
 * Material UI Theme Configuration
 *
 * Centralized theme using design tokens - NO hardcoded values allowed!
 * All colors, spacing, typography must come from theme.
 */

export const getMuiTheme = (mode: "light" | "dark", tokens: DesignTokens) => {
  const isDark = mode === "dark";
  const colorTokens = isDark ? tokens.dark : tokens.light;

  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: colorTokens.primaryGreen,
        light: isDark
          ? colorTokens.primaryGreen
          : tokens.light.primaryGreenLight,
        dark: isDark ? colorTokens.primaryGreen : tokens.light.primaryGreenDark,
        contrastText: "#ffffff",
      },
      secondary: {
        main: colorTokens.primaryOrange,
        light: isDark
          ? colorTokens.primaryOrange
          : tokens.light.primaryOrangeLight,
        dark: isDark
          ? colorTokens.primaryOrange
          : tokens.light.primaryOrangeDark,
        contrastText: "#ffffff",
      },
      error: {
        main: colorTokens.error,
        light: alpha(colorTokens.error, 0.1),
        dark: colorTokens.error,
        contrastText: "#ffffff",
      },
      warning: {
        main: colorTokens.warning,
        light: alpha(colorTokens.warning, 0.1),
        dark: colorTokens.warning,
        contrastText: "#ffffff",
      },
      info: {
        main: colorTokens.info,
        light: alpha(colorTokens.info, 0.1),
        dark: colorTokens.info,
        contrastText: "#ffffff",
      },
      success: {
        main: colorTokens.success,
        light: alpha(colorTokens.success, 0.1),
        dark: colorTokens.success,
        contrastText: "#ffffff",
      },
      background: {
        default: colorTokens.background,
        paper: colorTokens.surface,
      },
      text: {
        primary: colorTokens.textPrimary,
        secondary: colorTokens.textSecondary,
      },
      divider: isDark
        ? tokens.dark.divider
        : alpha(tokens.light.textSecondary, 0.12),
    },
    shape: {
      borderRadius: 8,
    },
    spacing: 8, // Base spacing unit (1 = 8px, 2 = 16px, etc.)
    typography: {
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: "2.5rem",
        lineHeight: 1.2,
      },
      h2: {
        fontWeight: 700,
        fontSize: "2rem",
        lineHeight: 1.3,
      },
      h3: {
        fontWeight: 600,
        fontSize: "1.75rem",
        lineHeight: 1.3,
      },
      h4: {
        fontWeight: 600,
        fontSize: "1.5rem",
        lineHeight: 1.4,
      },
      h5: {
        fontWeight: 600,
        fontSize: "1.25rem",
        lineHeight: 1.4,
      },
      h6: {
        fontWeight: 600,
        fontSize: "1rem",
        lineHeight: 1.5,
      },
      body1: {
        fontSize: "1rem",
        lineHeight: 1.5,
      },
      body2: {
        fontSize: "0.875rem",
        lineHeight: 1.5,
      },
      button: {
        textTransform: "none", // Disable uppercase transformation
        fontWeight: 500,
      },
    },
    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: "8px 16px",
            fontWeight: 500,
            transition: "all 0.2s ease-in-out",
            "&:active": {
              transform: "scale(0.98)",
            },
          },
          sizeLarge: {
            padding: "12px 24px",
            fontSize: "1.125rem",
          },
          sizeSmall: {
            padding: "4px 12px",
            fontSize: "0.875rem",
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: "outlined",
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none", // Remove MUI default gradient
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
          },
        },
      },
    },
  });

  return theme;
};
