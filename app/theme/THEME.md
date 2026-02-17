# enPlace Theme System Guide

## How the Theme System Works

### Architecture Overview

**ThemeProvider** (`providers/ThemeProvider.tsx`) is the source of truth:
- Exports `useTheme()` hook
- Returns `{ colors, isMichelin }`
- No `useAuth()` dependency (listens to Supabase directly)
- Persists: Supabase (logged in) / SQLite (logged out)

**Unified Theme** (`theme/unified.ts`):
- Single source of truth for type definitions
- All themes must implement `Theme` interface
- Provides `classic` and `michelin` theme objects

### Creating a Third Theme

#### 1. Define Colors in `theme/{name}.ts`

```typescript
export const myNewTheme = {
  name: 'myNewTheme',
  colors: {
    primary: { 900: '#...', 700: '#...', 500: '#...', 300: '#...', 100: '#...' },
    secondary: { 900: '#...', 700: '#...', 500: '#...', 300: '#...', 100: '#...' },
    neutral: {
      900: '#...',  // PRIMARY TEXT (white if dark theme, dark if light theme)
      700: '#...',  // SECONDARY TEXT (silver/gray for accents)
      500: '#...',  // Muted elements
      300: '#...',  // Borders (USE WITH CAUTION - different meanings per theme)
      200: '#...',  // Subtle backgrounds
      100: '#...',  // Lightest elements
    },
    cream: { 900: '#...', 700: '#...', 500: '#...', 300: '#...', 100: '#...' },
    background: {
      primary: '#...',    // Main screen background
      secondary: '#...',  // Card backgrounds
      tertiary: '#...',   // Subtle overlays/inputs
    },
  }
};
```

#### 2. Export in `theme/unified.ts`

```typescript
export { myNewTheme } from './my-new-theme';

export const themes = {
  classic,
  michelin,
  myNewTheme,  // Add here
} as const;
```

#### 3. Add to ThemeProvider State

In `providers/ThemeProvider.tsx`:
```typescript
type ThemeName = 'classic' | 'michelin' | 'myNewTheme';
```

#### 4. Test in Profile Screen

Add toggle option in Profile screen to test the new theme immediately.

## Critical Rules

### Neutral Scale Inversion
| Theme | neutral[900] | neutral[700] | neutral[300] |
|-------|-------------|--------------|--------------|
| **Classic** | #1F1F1F (dark) | #4A4A4A | #C4C4C4 (light) |
| **Michelin** | #FFFFFF (white) | #C9C5BD | #4A4844 (dark) |

**NEVER use neutral[300] for text!**
- In Classic: it's light gray ✓
- In Michelin: it's dark graphite ✗ (invisible on dark bg)

### Text Color Convention
- **Primary text**: `colors.neutral[900]`
- **Secondary text**: `colors.neutral[700]`
- **Muted text**: `colors.neutral[500]`

### Container Backgrounds
- **Screen background**: `colors.background?.primary`
- **Card background**: `colors.background?.secondary`
- **Input/subtle**: `colors.background?.tertiary`

### Borders
- **Dividers**: `colors.neutral[700]` (Michelin) / `colors.neutral[300]` (Classic)
- **Cards**: Use ternary based on theme

## Common Mistakes to Avoid

1. **Hardcoded hex values** — Always use theme colors
2. **Using neutral[300] for text** — Will disappear in dark themes
3. **Using neutral[400] or [600]** — These DON'T EXIST in fine-dining theme
4. **`colors.white`** — Use `neutral[900]` instead (adapts to theme)
5. **Using useAuth() in ThemeProvider** — Causes circular dependency

## Style Pattern

```typescript
const dynamicStyles = createStyles(colors, isMichelin);

const createStyles = (colors: any, isMichelin: boolean) => ({
  container: {
    backgroundColor: colors.background?.primary,
  },
  title: {
    color: colors.neutral[900],  // Always works
  },
  subtitle: {
    color: colors.neutral[700],  // Always works
  },
  card: {
    backgroundColor: colors.background?.secondary,
    borderColor: isMichelin ? colors.neutral[700] : colors.neutral[300],
  },
});
```

## Theme Testing Checklist

- [ ] All text visible in both themes
- [ ] No hardcoded hex colors (except intentional brand colors)
- [ ] Cards have proper contrast
- [ ] Inputs visible and usable
- [ ] Floating buttons blend with background
- [ ] Borders use appropriate shade for theme
- [ ] Empty states visible

## Known Theme Values

### Classic Theme
- `neutral[900]` = #1F1F1F (dark text)
- `neutral[700]` = #4A4A4A (secondary text)
- `neutral[300]` = #C4C4C4 (light borders)
- `background.primary` = cream[50]

### Michelin Theme
- `neutral[900]` = #FFFFFF (white text)
- `neutral[700]` = #C9C5BD (silver text)
- `neutral[300]` = #4A4844 (dark borders)
- `background.primary` = #181716 (near black)
- `background.secondary` = #1F1E1D (dark card)
- `background.tertiary` = #2A2928 (subtle overlay)
