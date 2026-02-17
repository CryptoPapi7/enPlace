# enPlace Editing Architecture

This document describes how **editing** works across the enPlace app: how data is modified, where state lives, how persistence happens, and the design principles behind it. This is meant to make future feature work (new editors, new entities, sync, undo, etc.) predictable and safe.

---

## High-Level Philosophy

**Editing in enPlace is:**
- Local-first
- Optimistic
- Screen-owned (no global edit store)
- Persisted explicitly (never implicitly)

There is **no global "edit mode" or form state manager**. Each screen owns its own editing lifecycle and decides when data becomes durable.

---

## Core Editing Patterns

### 1. Screen-Local State (Primary Pattern)

Most editing happens via `useState` inside the screen:

```ts
const [servings, setServings] = useState(recipe.servings)
const [myNotes, setMyNotes] = useState<Record<string, string>>({})
```

**Rules:**
- State lives only for the lifetime of the screen
- No writes happen on every keystroke unless explicitly intended
- Derived values (ratios, times) are computed, not stored

This is used in:
- `RecipeScreen` (servings, notes)
- `CookScreen` (step progress)
- `PlanWeekScreen` (meals, days)

---

### 2. Explicit Persistence Boundaries

Data is persisted **only at intentional boundaries**:

| Feature | When it saves | Where |
|------|-------------|------|
| Theme | On toggle | Supabase / SQLite |
| Weekly plan | On state change | SQLite |
| Recipes (local) | On Save / Delete | SQLite |
| Recipes (logged in) | On Save / Publish | Supabase |

Example (weekly plan):

```ts
useEffect(() => {
  saveWeeklyPlan(weekPlan)
}, [weekPlan])
```

This is a **controlled exception**: weekly plans auto-save because they are ephemeral and user-driven.

---

## Recipe Editing Architecture

### Creation

Recipes can be created via:
1. AI generation (`CreateRecipeScreen`)
2. Manual input
3. Import (web / photo)

Flow:
```
User Input / AI
  ↓
Zod Validation (`parseAIRecipe`)
  ↓
RecipePreviewScreen
  ↓
Save → SQLite or Supabase
```

**Key rules:**
- Validation ALWAYS happens before persistence
- Preview is the last checkpoint before saving

---

### Updating Existing Recipes

Edits are **patch-based**, not replace-based:

```ts
updateRecipe(id, {
  title,
  ingredients,
  instructions,
})
```

Internally this:
- Builds SQL `SET` clauses dynamically
- Updates `updated_at`
- Leaves untouched fields intact

This avoids accidental data loss.

---

## Weekly Plan Editing

### Data Model

```ts
DayPlan {
  date
  dayName
  meals: PlannedMeal[]
}

PlannedMeal {
  recipeId
  recipeName
  emoji
  serveTime
  servings
}
```

### Editing Operations

All edits are **immutable transformations**:

- Add meal
- Remove meal
- Move meal
- Change servings

Pattern:
```ts
const newPlan = [...weekPlan]
newPlan[day].meals.push(meal)
setWeekPlan(newPlan)
```

There is **no in-place mutation** of nested state.

---

## Cook Mode Editing

Cook mode is intentionally **non-destructive**.

Editable elements:
- Current step
- Step timer
- Navigation (Back / Next)

What is NOT edited:
- Recipe content
- Ingredients
- Instructions

Cook state is ephemeral and resets on exit.

---

## Notes Editing (My Notes)

Notes are:
- Keyed by `recipeId`
- Stored locally
- Optional

```ts
setMyNotes(prev => ({
  ...prev,
  [recipeId]: text
}))
```

Notes do not affect the recipe object itself.

---

## What Editing Is *Not*

- ❌ No global form store
- ❌ No Redux/Zustand
- ❌ No auto-sync on every keystroke
- ❌ No shared mutable state

This is intentional to keep editing predictable.

---

## Design Constraints (Important)

1. **Offline-first**
   - Editing must work without network

2. **Crash-safe**
   - Partial edits should never corrupt saved data

3. **Composable**
   - New editors should follow existing patterns

4. **Explicit saves**
   - Except where auto-save is intentional (weekly plan)

---

## Adding a New Editable Feature

Checklist:
- [ ] State lives in the screen
- [ ] Validation before persistence
- [ ] Explicit save boundary
- [ ] Uses SQLite when offline
- [ ] Uses Supabase only when authenticated
- [ ] No hardcoded side effects

If you follow this, the feature will fit cleanly into the system.

---

## Future Improvements (Not Implemented Yet)

- Undo/redo for plan editing
- Draft autosave for long recipe edits
- Sync conflict resolution
- Shared editing (multi-device)

These were intentionally deferred.
