Quizda Theme Tokens

Location: client/src/theme

- designTokens.css: CSS variable export for light and dark modes. Use `document.documentElement.setAttribute('data-theme', 'dark')` to toggle the dark token set.
- designTokens.ts: TypeScript mapping of tokens so they can be used in code; keep in sync with CSS variables.
- designSystem.ts: creates an MUI theme using the tokens; expose `getMuiTheme(mode, designTokens)` to wire into MUI ThemeProvider.

Usage Guidance:

- Prefer `var(--surface)` or `var(--text-primary)` for colors in stylesheets and sx prop.
- When you need programmatic access for MUI or inline JS styles, import `designTokens` from designTokens.ts and use tokens directly.
- Do NOT use hard-coded hex values; use tokens instead.

Example:

- In a React component using MUI, to color a Button with the primary green: `sx={{ color: 'var(--primary-green)' }}` or use the MUI palette created by `getMuiTheme`.

Accessibility:

- Use the tokens to satisfy WCAG contrast. Test using Lighthouse or your preferred contrast tools.
