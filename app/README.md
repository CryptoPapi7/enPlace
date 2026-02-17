# enPlace 🍳

**enPlace** is a calm, offline‑first cooking app designed to help you cook one dish end‑to‑end without distraction.

No feeds. No noise. Just you and the recipe.

---

## ✨ Core Principles

- **Offline‑first** – your recipes work without an internet connection
- **Single‑recipe focus** – cook one dish, step by step
- **Calm UX** – no discovery, no social layer, no pressure
- **User‑owned data** – authenticated, private, portable

---

## 🧱 Architecture Overview

enPlace uses a **hybrid offline‑first architecture** combining local SQLite storage with Supabase for authentication and cloud persistence.

### High‑level Flow

```
Supabase (Auth + DB)
        ↓
  Hydration / Sync
        ↓
     SQLite (local)
        ↓
        UI
```

- **Supabase** is the canonical cloud backend
- **SQLite** is the local source for fast reads and offline use
- **Schemas** define a single contract shared across layers

---

## 🔐 Authentication (Supabase)

- Email / password authentication via Supabase Auth
- Session is managed globally in the app
- Recipes are scoped to the authenticated user

Environment variables are required (see setup below).

---

## 💾 Data Layer

### Supabase
- Stores user accounts and recipes
- Recipes are tied to `user_id`
- Acts as the long‑term, cross‑device source of truth

### SQLite (Offline)
- Lives locally on device
- Mirrors the recipes schema
- Used for:
  - Offline access
  - Fast reads
  - App resilience

> Sync logic is intentionally simple in v0.x and will evolve.

---

## 📐 Schemas

All core data structures live in the `schemas/` directory and are shared across:

- Supabase queries
- SQLite table definitions
- UI components and screens

This ensures consistency and reduces drift between layers.

---

## 🎨 Theme System

- Global theme manager
- Two built‑in themes:
  - **Classic** – warm, cozy, everyday cooking
  - **Michelin Star** – dark, refined, fine‑dining feel
- Theme selection is persisted locally
- All screens are fully theme‑aware

---

## 🚀 Local Development

### Prerequisites

- Node.js
- Expo CLI
- Supabase project

### Environment Variables

Create a `.env` file with:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Run the App

```bash
npm install
npx expo start
```

---

## 📦 Tech Stack

- **Expo / React Native**
- **Supabase** (Auth + Postgres)
- **SQLite** (offline storage)
- **TypeScript**

---

## 🛣 Roadmap (High Level)

- Improved sync conflict handling
- Recipe versioning
- Multi‑device polish
- Export / backup options

---

## Philosophy

enPlace is intentionally small.

If it doesn’t help you cook *this* dish, *right now*, it doesn’t belong here.
