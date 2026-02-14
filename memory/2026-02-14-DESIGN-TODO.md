# Design Improvements TODO - EnPlace

## Priority Order (work 1 by 1, test after each)

### ✅ DONE (Pre-work)
- [x] Commit current state to GitHub

---

### Task 1: Create Theme System (Foundation)
**Files to create:**
- `app/theme/colors.ts` - Full color palette (cream, orange, neutrals)
- `app/theme/spacing.ts` - 8px grid system
- `app/theme/typography.ts` - Font scale (28/24/17/15)
- `app/theme/shadows.ts` - Subtle elevation values

**Test:** App still loads, no visual changes yet (foundation only)

---

### Task 2: Update Global Styles
**Files to edit:**
- `app/app/_layout.tsx` - Apply theme background color
- `app/constants/theme.ts` or create new theme file
- Update SafeAreaView backgrounds across screens

**Visual change:** Consistent cream background everywhere
**Test:** Check all screens have matching background

---

### Task 3: Redesign Cook Mode (Priority Screen)
**Files to edit:**
- `app/screens/CookScreen.tsx`

**Changes:**
- Massive step text (Display 28pt)
- Thin progress bar at top
- Better step dots (smaller, more elegant)
- Floating voice button with glow
- Timer pill-style display
- Bottom nav bar tighter spacing

**Test:** Cook a recipe, check readability and feel

---

### Task 4: Card Component
**Files to create:**
- `app/components/Card.tsx`

**Styles:**
- Border radius 16
- Shadow md (subtle)
- Padding 16-20
- Cream-100 background

**Test:** Cards look consistent across Home/Library

---

### Task 5: Button Component
**Files to create:**
- `app/components/PrimaryButton.tsx`

**Interactions:**
- Press: scale 0.97, 120ms
- Orange primary, subtle pressed state

**Test:** Buttons feel responsive

---

### Task 6: Recipe Detail Hero
**Files to edit:**
- `app/screens/RecipeScreen.tsx`

**Changes:**
- Full-width hero image
- Gradient overlay (transparent → cream)
- Title over image
- Sticky "Start Cooking" CTA at bottom

**Test:** Recipe detail looks premium

---

### Task 7: Home Screen Cards
**Files to edit:**
- `app/screens/HomeScreen.tsx`

**Changes:**
- Cleaner card layout (image top, text below)
- One featured recipe, smaller list
- Better spacing, less clutter

**Test:** Home feels calmer

---

### Task 8: Tab Bar Refinement
**Files to edit:**
- `app/app/(tabs)/_layout.tsx`

**Changes:**
- Slightly taller
- Active: orange icon + label
- Inactive: neutral-500
- Clean divider line

**Test:** Tab bar looks polished

---

### Task 9: Empty States
**Files to edit:**
- Various screens with empty lists

**Design:**
- Friendly Lottie or illustration
- Clear headline
- One primary action button

**Test:** Empty states don't feel broken

---

### Task 10: Loading Skeletons
**Files to create:**
- `app/components/Skeleton.tsx`

**Usage:**
- Recipe cards shimmer
- Instead of spinners

**Test:** Loading feels smoother

---

## Summary
10 tasks total. Estimated: 2-3 hours of work.
Each tested individually before moving on.
