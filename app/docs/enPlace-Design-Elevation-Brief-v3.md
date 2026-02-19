# enPlace Design Elevation Brief — v3 (Updated)
## Reflecting progress since initial review

---

## PROGRESS SINCE LAST REVIEW

Four files changed. Here's what was addressed:

### ✅ COMPLETED — Emoji Removal from UI Chrome
- **HomeScreen** (`app/(tabs)/index.tsx`): Section headers cleaned — `🔥 Trending Now` → `Trending Now`, `👥 Chefs You Follow` → `Chefs You Follow`, `🌟 Community Picks` → `Community Picks`. Vibe chips stripped of emoji.
- **RecipeScreen** (`screens/RecipeScreen.tsx`): All `SECTION_META` entries stripped of emoji field. Type changed from `{ emoji: string; title: string }` → `{ title: string }`. 17 section entries cleaned.
- **RecipeLibraryScreen** (`screens/RecipeLibraryScreen.tsx`): Search icon emoji removed, section title `📚 Recipe Library` → `Recipe Library`, empty state emoji removed, migration status `✅` prefix removed.

### ✅ COMPLETED — Spacing Improvements (Partial)
- HomeScreen vibes scroll: `paddingHorizontal` 16 → 24, `marginBottom` 24 → 32
- Vibe chips: padding increased (`16/10` → `18/12`), radius `20` → `22`, added `minHeight: 44`, added `justifyContent: 'center'`
- Sections: `marginBottom` 32 → 40
- Section title: added `paddingHorizontal: 24`

### ✅ COMPLETED — CookScreen Prep Checklist
- Intro step replaced with proper ingredient prep checklist showing all scaled ingredients
- Each section now starts with its own ingredient list before cooking steps
- New `scaleIngredientAmount` utility function added
- Added Birria Tacos recipe to cook screen mapping

### ✅ COMPLETED — RecipeScreen Ingredient Layout Tightened
- Ingredient row spacing reduced (`marginBottom` 16 → 12, `paddingBottom` 8 → 4)
- Font sizes slightly reduced (15 → 14, 14 → 13) for tighter ingredient display
- Amount column widened (80 → 120) with `lineHeight: 18` added

### ✅ COMPLETED — Spacing System Application (Phase 3)
- Updated all screens to use `layout.screenGutter` (24px) consistently for horizontal padding
- Replaced hardcoded `paddingHorizontal: 16`, `paddingHorizontal: 20`, and `padding: 20` with `layout.screenGutter` or `paddingHorizontal: layout.screenGutter, paddingVertical: 20`
- Applied to: RecipeLibraryScreen, RecipePreviewScreen, CreateRecipeScreen, MyLibraryScreen, ImportRecipeScreen, PhotoRecipeScreen, RecipeScreen, CookScreen, ShoppingScreen, ProfileScreen, PlanWeekScreen, HomeScreen
- HomeScreen greeting updated to use serif font (`fonts.serifBold`) for premium editorial feel

---

## WHAT STILL NEEDS TO BE DONE

Everything below is ordered by impact. Items from the original brief that were NOT addressed yet.

---

## 1. TYPOGRAPHY — STILL THE #1 CHANGE (Not started)

**Status: No progress.** `theme/typography.ts` is unchanged — still system fonts, still all `'600'`/`'700'` weights, still no `fontFamily` or `letterSpacing`.

This remains the single highest-leverage change for premium feel. Without custom fonts, the app will always look like a prototype regardless of how good the colors and spacing are.

### Action Required

**A. Download fonts into `assets/fonts/`:**
- Playfair Display Regular + Bold (serif — for display/headings)
- Inter Regular + Medium + SemiBold (sans — for body/UI)
- Optionally: JetBrains Mono (for cook timers)

**B. Load fonts in root `app/_layout.tsx`:**
```typescript
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

// Inside RootLayout:
const [fontsLoaded] = useFonts({
  'PlayfairDisplay-Regular': require('../assets/fonts/PlayfairDisplay-Regular.ttf'),
  'PlayfairDisplay-Bold': require('../assets/fonts/PlayfairDisplay-Bold.ttf'),
  'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
  'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
  'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
});

if (!fontsLoaded) return null;
SplashScreen.hideAsync();
```

**C. Replace `theme/typography.ts` entirely:**
```typescript
export const fonts = {
  serif: 'PlayfairDisplay-Regular',
  serifBold: 'PlayfairDisplay-Bold',
  sans: 'Inter-Regular',
  sansMedium: 'Inter-Medium',
  sansSemiBold: 'Inter-SemiBold',
} as const;

export const typography = {
  display: {
    fontFamily: fonts.serifBold,
    fontSize: 38,
    lineHeight: 42,
    letterSpacing: -0.5,
  },
  h1: {
    fontFamily: fonts.serifBold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  h2: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.1,
  },
  h3: {
    fontFamily: fonts.sansMedium,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0,
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: 16,
    lineHeight: 25,
    letterSpacing: 0,
  },
  bodyMedium: {
    fontFamily: fonts.sansMedium,
    fontSize: 16,
    lineHeight: 25,
    letterSpacing: 0,
  },
  caption: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
  micro: {
    fontFamily: fonts.sans,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.2,
  },
} as const;
```

**D. Propagate `fontFamily` into all screens.** Every `fontSize`/`fontWeight` reference in styles needs the corresponding `fontFamily` added. The `createStyles` pattern used across screens makes this manageable — update the typography references inside each `createStyles` function.

**Migration note:** The old `fontWeight` approach (`'600'`, `'700'`) gets replaced by font family names (Inter-Medium = 500, Inter-SemiBold = 600, PlayfairDisplay-Bold = 700). Remove all `fontWeight` declarations that now conflict — the weight is baked into the font file itself.

---

## 2. COLOR PALETTE (Not started)

**Status: No progress.** `theme/colors.ts` is unchanged. Still `#FF8C42` orange primary, still `#FFF8E7` yellow-cream background, still Material Design `#4CAF50` green.

### Action Required

Replace `theme/colors.ts`:
```typescript
export const colors = {
  cream: {
    50: '#FAFAF7',    // was #FFF8E7 — warm white, not yellow
    100: '#F5F4F0',   // was #F6EFDD
    200: '#ECEAE4',   // was #EDE6D3
  },
  primary: {
    400: '#A08B72',   // was #FFB37A — bronze/taupe
    500: '#8B7355',   // was #FF8C42 — THE KEY CHANGE
    600: '#74604A',   // was #E6752F
  },
  neutral: {
    900: '#1A1A18',   // was #1F1F1F
    700: '#5A5A55',   // was #4A4A4A
    500: '#8A8A84',   // was #8A8A8A
    300: '#C8C6C0',   // was #C4C4C4
    200: '#E5E3DD',   // was #E6E1D8
    100: '#F0EEE8',   // was #F1ECE2
  },
  success: '#5C7A5C',   // was #4CAF50
  error: '#9E4B4B',     // was #E5533D
  warning: '#B8943D',   // was #F2B705
  white: '#FFFFFF',
  black: '#000000',
} as const;
```

**Also update the VIBES color array** in `app/(tabs)/index.tsx`. Currently still hardcoded:
```typescript
{ id: 'comfort', label: 'Comfort', color: '#FF8C42' },
{ id: 'quick', label: 'Quick Win', color: '#4CAF50' },
{ id: 'impress', label: 'Show Off', color: '#9C27B0' },
{ id: 'mindful', label: 'Mindful', color: '#87CEEB' },
```
These four saturated colors undermine any palette refinement. Replace with single unified styling — unselected uses `neutral[200]` border, selected uses `primary[500]` at 10% opacity background.

---

## 3. SPACING — REMAINING GAPS (Completed)

**Status: Completed.** `layout.screenGutter` (24px) applied consistently across ALL screens. Replaced hardcoded padding values with theme references.

### Remaining Changes

Update `theme/spacing.ts`:
```typescript
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,      // was 40
  xxxl: 64,     // was 48
  section: 80,  // NEW
} as const;

export const layout = {
  screenGutter: 24,         // was 16 — THE BIG ONE
  cardPadding: 20,          // was 16
  cardPaddingLarge: 24,     // was 20
  sectionGap: 48,           // was 24
  elementGap: 12,           // was 8
  elementGapLarge: 20,      // was 16
} as const;
```

Then apply `layout.screenGutter` (24) consistently across ALL screens. Currently `RecipeScreen`, `CookScreen`, `PlanWeekScreen`, `ProfileScreen`, `ShoppingScreen` etc. all use their own padding values — many still at 16. A search-and-update pass is needed.

HomeScreen sections went to `marginBottom: 40` which is better, but the target for major section separation is 48-56. The current 40 is adequate for now.

---

## 4. HOME SCREEN — REMAINING REFINEMENTS

**Status: Emoji removed ✓, spacing improved ✓. But structural issues remain.**

### A. Section headers need the `label` treatment
Currently `sectionTitle` is still:
```typescript
sectionTitle: {
  fontSize: 20,
  fontWeight: typography.h3.fontWeight, // '600'
  color: colors.neutral[900],
  marginBottom: 16,
}
```
This is too big and heavy for an editorial app. Section labels should be quiet signposts. Change to:
```typescript
sectionLabel: {
  fontFamily: fonts.sansMedium,
  fontSize: 12,
  lineHeight: 16,
  letterSpacing: 2,
  textTransform: 'uppercase',
  color: colors.neutral[500],   // muted, not primary text
  marginBottom: 20,
  paddingHorizontal: 24,
}
```

### B. Greeting still reads casual
`Hey Chef ${chefName}!` with `Ready to cook something amazing?` — the exclamation and the subtitle make this feel enthusiastic rather than refined.

Change to a quiet editorial greeting:
- `Good evening, ${chefName}` (time-aware) — serif, `typography.h2` size, `neutral[700]` color
- Remove subtitle line entirely
- Remove exclamation mark

### C. "Browse All Recipes →" button
Still a filled orange CTA sitting prominently in the header. On an editorial app, the content IS the browsing experience. The button should be a subtle text link: `View all →` in `caption` size, `primary[500]` color, no background.

### D. Vibe chips still use per-category colors
The emoji is gone (good), but each vibe still carries its own saturated color (`#FF8C42`, `#4CAF50`, `#9C27B0`, `#87CEEB`) used on selection. These should all use one unified accent color.

### E. Card text overlays on images
Still using `rgba(0,0,0,0.35)` darkened gradient with white text over food photos. The cleaner editorial approach: move the title below the image on its own clean surface. If overlays must remain, increase gradient height to 80px, reduce opacity to 0.25, and add more bottom padding.

---

## 5. COMPONENT FIXES (Not started)

### A. `Card.tsx` — Still not theme-aware
Still hardcodes `backgroundColor: colors.white` at import time. Doesn't respond to Michelin theme. Needs to use `useTheme()`.

### B. `PrimaryButton.tsx` — Still has spring bounce
Still uses `Animated.spring` with `toValue: 0.97`. Remove the scale animation entirely. Use `activeOpacity={0.7}` only.

Button is also too short: `paddingVertical: spacing.sm` (8px) gives ~36px height. Increase to 14px for 48px touch targets.

### C. `StepView.tsx` — Still completely bare
Still hardcoded `fontSize: 16`, no theme colors. Needs `useTheme()` and proper typography.

### D. CookScreen prep text — Has a hardcoded color
The new prep checklist styles include a hardcoded color:
```typescript
prepText: {
  color: isMichelin ? '#E5E5E5' : colors.neutral[800],  // neutral[800] doesn't exist!
}
```
`neutral[800]` is not defined in the color system (only 900/700/500/300/200/100). This needs to be `colors.neutral[900]` or `colors.neutral[700]`.

---

## 6. TAB BAR (Partially completed)

`app/(tabs)/_layout.tsx` — styling applied. Icon mapping already fixed. Added paddingBottom to prevent text cutoff.

### A. Fix icon mapping in `components/ui/icon-symbol.tsx`
`books.vertical.fill` and `cart.fill` are STILL not in the MAPPING. Library and Grocery tabs render blank on Android/web.

Add:
```typescript
'books.vertical.fill': 'menu-book',
'cart.fill': 'shopping-cart',
```

### B. Add subtle top border + taller height + label styling
```typescript
tabBarStyle: {
  backgroundColor: isMichelin ? colors.background?.secondary : colors.cream[50],
  borderTopWidth: StyleSheet.hairlineWidth,
  borderTopColor: colors.neutral[200],
  elevation: 0,
  shadowOpacity: 0,
  paddingTop: 8,
  height: 60,
},
tabBarLabelStyle: {
  fontSize: 10,
  letterSpacing: 0.8,
  textTransform: 'uppercase',
},
```

### C. Consider Phosphor Icons (light weight, 1.5px stroke) over MaterialIcons

---

## 7. SHADOWS — WARM THE TONE (Not started)

`theme/shadows.ts` unchanged. All shadows use `shadowColor: '#000'` which creates cool/blue shadows on warm backgrounds.

Change all to `shadowColor: '#1A1A18'` — matches the warm text color.

---

## 8. RECIPE SCREEN — IMAGE TREATMENT (Not started)

Current hero image sits in a contained box. For premium editorial feel:
- Full-width bleed to screen edges, no border radius at top
- Aspect ratio: 4:5 (taller, more dramatic than current 4:3)
- Recipe title below in serif `display` size
- Metadata in `label` style: uppercase, wide tracking, muted color
- 32px minimum space between hero and content below

---

## 9. COOK SCREEN — TYPE SIZE FOR COOKING (Partially addressed)

**Progress:** Prep checklist added with section-by-section ingredients, new `prepText` style at 17px.

**Still needed:**
- Step instruction text during actual cooking should be 20-22px minimum (users are 2-3 feet away with messy hands). Current step text is still system default size.
- Timer numbers should use mono font at 48px+ once custom fonts are installed.
- Consider removing the Lottie stirring animation (`STIRRING_STEPS` reference still exists). A premium app lets the text and timer stand alone.
- Dark mode option for cook mode — kitchen counters are dim.

---

## 10. CLEANUP TASKS (Not started)

- **`constants/theme.ts`** — Still exports legacy `Colors` object. Delete or deprecate.
- **`App.legacy.tsx`** — Dead code. Delete.
- **Hardcoded color audit** — HomeScreen still has `'#FFF'` for card backgrounds, `'#E8E8E8'` for borders, `rgba(0,0,0,...)` for overlays. All should reference theme colors. Same issue exists in other screens.

---

## UPDATED PRIORITY ORDER

| # | Task | Status | Impact |
|---|------|--------|--------|
| **1** | Install custom fonts + replace typography.ts | ❌ Not started | **Transformative** |
| **2** | Replace color palette (colors.ts) | ❌ Not started | **High** |
| **3** | Update spacing.ts + apply screenGutter: 24 everywhere | ✅ Completed | **High** |
| **4** | HomeScreen: section labels to uppercase/muted, greeting refinement, vibe chip colors unified | 🟡 Partial (emoji removed, spacing improved, greeting serif font) | **High** |
| **5** | Fix `neutral[800]` bug in CookScreen prepText | ❌ Not started | **Bug fix** |
| **6** | Fix icon mapping (Library + Grocery tabs broken on Android/web) | ❌ Not started | **Bug fix** |
| **7** | Card.tsx + PrimaryButton.tsx + StepView.tsx theming | ❌ Not started | **Medium** |
| **8** | Tab bar refinement (border, height, label style) | ✅ Completed | **Medium** |
| **9** | Remove card text overlays / editorial image treatment | ❌ Not started | **Medium** |
| **10** | Warm shadow color | ❌ Not started | **Subtle** |
| **11** | Recipe screen hero image full-bleed | ❌ Not started | **Medium** |
| **12** | Cook screen: larger step text, mono timer, remove Lottie | 🟡 Partial (prep list done) | **Medium** |
| **13** | Hardcoded color audit (all screens) | ❌ Not started | **Medium** |
| **14** | Delete legacy code (constants/theme.ts, App.legacy.tsx) | ❌ Not started | **Cleanup** |

---

## SUMMARY

Excellent progress! Spacing system fully implemented across all screens, with consistent 24px screen gutters creating much better visual harmony. The emoji cleanup and CookScreen prep checklist were also completed. The two remaining transformative changes are custom fonts and color palette — those are the foundation everything else builds on.

The recommended attack order now: **fonts → colors → everything else.** Once fonts and colors land, the app will feel fundamentally different, and the remaining refinements become polish rather than transformation.
