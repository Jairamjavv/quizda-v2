import { createTheme } from "@mui/material/styles";

// Using tokens in the MUI theme where applicable. Color values are taken from tokens in designTokens.ts

export const getMuiTheme = (mode: "light" | "dark", tokens: any) => {
  const palette = {
    mode,
    primary: {
      main:
        mode === "light" ? tokens.light.primaryGreen : tokens.dark.primaryGreen,
    },
    secondary: {
      main:
        mode === "light"
          ? tokens.light.primaryOrange
          : tokens.dark.primaryOrange,
    },
    background: {
      default:
        mode === "light" ? tokens.light.background : tokens.dark.background,
      paper: mode === "light" ? tokens.light.surface : tokens.dark.surface,
    },
    text: {
      primary:
        mode === "light" ? tokens.light.textPrimary : tokens.dark.textPrimary,
      secondary:
        mode === "light"
          ? tokens.light.textSecondary
          : tokens.dark.textSecondary,
    },
  };

  const theme = createTheme({
    palette,
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
      },
    },
  });

  // Override default typography weights or fonts if desired
  theme.typography.h6 = {
    ...theme.typography.h6,
    fontWeight: 600,
  };

  return theme;
};
