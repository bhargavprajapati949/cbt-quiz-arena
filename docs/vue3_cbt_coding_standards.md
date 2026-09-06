# Vue 3 Development Instructions: Static CBT Simulator

Authoritative guidance for building the client-side CBT Simulator application. Default to the **Composition API** with `<script setup lang="ts">`, the modern reactivity system, and the project-specific ecosystem (Vite, Pinia, Tailwind CSS, Shadcn-Vue).

## Project Context & Architecture
- **Environment:** 100% client-side SPA hosted on GitHub Pages. No backend.
- **Data Model:** Stateless loading of external JSON files; session state persisted entirely in browser `localStorage`.
- **Authoring:** `<script setup lang="ts">` single-file components (SFCs) as the default.
- **Core Libraries:** Pinia (with `pinia-plugin-persistedstate`), Vue Router, `markdown-it`, `katex`.

## Authoring Style & Component Design
- Use `<script setup>` exclusively.
- Single responsibility per component; split the CBT engine into distinct UI blocks (e.g., `QuestionDisplay`, `PaletteDrawer`).
- Co-locate component-specific types, and lift shared JSON schemas and state models into `src/types/index.ts`.

## Compiler Macros
- `defineProps<T>()` — declare typed props from a TypeScript interface.
- `withDefaults(defineProps<T>(), { ... })` — provide prop defaults.
- `defineEmits<{ change: [id: number]; update: [value: string] }>()` — declare typed events.
- `defineModel<T>()` (3.4+) — canonical way to implement two-way binding on custom inputs (e.g., manual grading inputs).
- Never mutate props directly — emit an event or derive local state.

## Reactivity System
- `ref()` for primitives and single references; auto-unwrapped in templates.
- `reactive()` for deep-reactive objects (like the parsed JSON quiz config). Never destructure directly without `toRefs()`.
- `computed()` for derived values (e.g., calculating Total Score dynamically from the attempts record).
- Use `watch` or `watchEffect` deliberately. Clean up timers (like the CBT countdown) using `onUnmounted` or `onWatcherCleanup`.
- Use `shallowRef` for large, static JSON datasets (like the raw question bank) to prevent unnecessary reactivity overhead.

## Composables (Reusable Logic)
- Extract test engine logic into `src/composables/useCbtEngine.ts` and countdown logic into `src/composables/useTimer.ts`.
- Set up and tear down `setInterval` inside the composable's `onMounted`/`onUnmounted` hooks to prevent memory leaks during view transitions.

## State Management with Pinia
- Use Pinia setup stores (`defineStore('testSession', () => { ... })`).
- Mandate `pinia-plugin-persistedstate` to ensure the `SessionState` syncs to `localStorage` on every user action (crash recovery requirement).
- Keep actions strictly synchronous since there are no backend APIs.

## Routing (GitHub Pages Specifics)
- Use `createWebHashHistory()` or configure Vite's `base: './'` with standard history to prevent 404 errors on GitHub Pages direct URL loads.
- Define routes (`/`, `/test`, `/result`) with lazy loading `component: () => import('...')`.
- Use navigation guards (`beforeEach`) to block access to `/test` or `/result` if no active session exists in Pinia.

## Styling & UI Components
- Default to **Tailwind CSS** utility classes in the `<template>` rather than custom CSS in `<style scoped>`.
- Use **Shadcn-Vue** components for structural elements (Buttons, Dialogs, Sheets, Radio Groups).
- Reserve `<style scoped>` for highly specific overrides (e.g., CSS `@media print` rules for the Result Page PDF export).

## Security & Content Rendering (Crucial)
- **Safe HTML Injection:** Because the app uses `markdown-it` and `katex`, rendering raw HTML via `v-html` is unavoidable.
- **Rule:** You *must* pass all compiled Markdown/Math strings through **DOMPurify** before binding them to `v-html` to prevent XSS from malicious JSON imports.

## Accessibility
- Ensure full keyboard operability for test navigation (Tab to options, Enter to save, Arrows for palette).
- Shadcn-Vue handles most ARIA attributes; ensure any custom floating elements use `<Teleport to="body">` to escape stacking contexts.

## Anti-Patterns to Avoid
- Mixing Options API and Composition API.
- Mutating props directly.
- Leaking `setInterval` timers when the test auto-submits or unmounts.
- Storing active test state only in RAM (bypassing `localStorage` and breaking crash recovery).
- Injecting unpurified Markdown/KaTeX directly into the DOM.
