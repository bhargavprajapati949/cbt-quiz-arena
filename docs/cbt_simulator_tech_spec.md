# Technical Specification: Static CBT Simulator (AI Agent Optimized)

## 1. Project Context & Objectives
**Target Persona:** AI Coding Assistant (Copilot / Cursor)
**Goal:** Implement a 100% client-side, stateless SPA for CBT simulation based on `cbt_simulator_prd.md`.
**Tech Stack:** 
- **Framework:** Vue 3 (Composition API, `<script setup>`), TypeScript
- **Bundler:** Vite
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn-Vue (Headless, accessible UI)
- **State Management:** Pinia (with `pinia-plugin-persistedstate`)
- **Content:** `markdown-it` (Markdown), `katex` (Math), native UTF-8 (Gujarati)

## 2. Directory Structure
Generate the project using the following strict layout:
```text
src/
├── assets/
│   └── main.css             # Tailwind imports & @media print rules
├── components/
│   ├── layout/
│   │   ├── HeaderBar.vue    # Top bar (Profile, Timer, Title)
│   │   └── ActionBar.vue    # Bottom sticky actions
│   ├── test/
│   │   ├── QuestionDisplay.vue # Markdown + KaTeX + MCQ/Textarea
│   │   └── PaletteDrawer.vue   # Grid navigation (Desktop Sidebar / Mobile Sheet)
│   └── ui/                  # Shadcn-vue generated components (Button, Sheet, RadioGroup, Dialog)
├── composables/
│   ├── useTimer.ts          # Countdown logic & auto-submit hook
│   ├── useCbtEngine.ts      # Core state transitions and scoring logic
│   └── useRemoteQuiz.ts     # Async fetch + schema validation for ?test=<URL> param
├── router/
│   └── index.ts             # Routes: '/' (Home), '/test' (TestView), '/result' (ResultView)
├── stores/
│   └── testSession.ts       # Pinia store + localstorage sync
├── types/
│   └── index.ts             # Global TypeScript interfaces
├── views/
│   ├── HomeView.vue         # File import, config, resume prompt, remote URL loading
│   ├── TestView.vue         # CBT execution layout
│   └── ResultView.vue       # Score dashboard & manual grading
├── App.vue
└── main.ts                  # App initialization, Pinia, Router setup
```

## 3. Data Models & TypeScript Interfaces (`src/types/index.ts`)

```typescript
// 1. Raw JSON Input Schema
export interface RawQuestion {
  id: number | string;
  question: string;
  options: Record<string, string>; // e.g., { "A": "Option 1", "B": "Option 2" }
  answer: string; // The correct key (e.g., "A") or empty for subjective
}

export interface QuizConfig {
  duration: number; // in minutes
  questions: RawQuestion[];
}

// 2. Internal State Enums
export enum QuestionStatus {
  NOT_VISITED = 'white',
  NOT_ANSWERED = 'red',
  ANSWERED = 'green',
  MARKED_FOR_REVIEW = 'purple',
  ANSWERED_AND_MARKED = 'purple-green'
}

// 3. User Attempt Record
export interface AttemptRecord {
  questionId: number | string;
  selectedOption: string | null; // Null if nothing selected. "OTHER" for custom.
  textResponse: string | null; // Used if options are empty or "OTHER" is selected
  status: QuestionStatus;
  manualScore?: number; // Used post-test for subjective grading
}

// 4. Pinia State Model
export interface SessionState {
  isActive: boolean;
  isCompleted: boolean;
  config: {
    duration: number;
    enableNegativeMarking: boolean;
  };
  questions: RawQuestion[];
  attempts: Record<string | number, AttemptRecord>;
  currentIndex: number;
  timeRemainingSec: number;
}
```

## 4. Core Algorithms & Logic

### 4.1 Navigation & Status Transitions (`src/composables/useCbtEngine.ts`)
*   **Initialization:** Map `QuizConfig` to `SessionState`. Initialize all questions to `NOT_VISITED` except index 0 (set to `NOT_ANSWERED`).
*   **Action: Save & Next:**
    *   Update current `AttemptRecord`.
    *   Set status to `ANSWERED` (if responded) or `NOT_ANSWERED` (if blank).
    *   Advance `currentIndex + 1`. Set next question to `NOT_ANSWERED` if it was `NOT_VISITED`.
*   **Action: Save & Mark for Review:**
    *   Update current `AttemptRecord`.
    *   Set status to `ANSWERED_AND_MARKED` (if responded) or `MARKED_FOR_REVIEW` (if blank).
    *   Advance index.
*   **Action: Mark for Review & Next:**
    *   Clear current selection in `AttemptRecord`.
    *   Set status to `MARKED_FOR_REVIEW`.
    *   Advance index.
*   **Action: Clear Response:**
    *   Nullify `selectedOption` and `textResponse` in current `AttemptRecord`.
    *   Set status to `NOT_ANSWERED`.

### 4.2 Scoring Engine
Executed on `/result` mount or upon manual score override.
*   **Correct:** +1
*   **Incorrect (Objective):** `-0.25` (if `config.enableNegativeMarking` is true), else `0`.
*   **Unattempted / Subjective (Pending) / "Other" Option:** `0` (default, subject to manual update).
*   **Formula:** `Total = (Correct * 1) + (Incorrect * NegativePenalty) + Sum(ManualScores)`

### 4.3 Timer & Resiliency (`src/composables/useTimer.ts`)
*   Run `setInterval(tick, 1000)` updating `timeRemainingSec` in Pinia.
*   Pinia `pinia-plugin-persistedstate` automatically syncs state to `localStorage`.
*   **Auto-Submit:** If `timeRemainingSec <= 0`, clear interval, set `isCompleted = true`, and router.push('/result').
*   **Crash Recovery:** On `HomeView.vue` mount, check Pinia store. If `isActive === true && isCompleted === false`, prompt user to resume.

## 5. UI/UX Specifications

### 5.1 Test Interface
*   **Left Column (75% width):** Renders the Question.
    *   Pipeline: Raw String -> Markdown-it -> KaTeX -> v-html wrapper.
    *   Inject an internal option `{ "OTHER": "Other (Write Answer)" }` into the render loop for MCQ questions.
    *   If `selectedOption === 'OTHER'` or `Object.keys(options).length === 0`, render a `<textarea class="w-full h-32 border p-2">`.
*   **Right Column (25% width - Palette):**
    *   Grid of buttons showing question numbers.
    *   Color mapping strictly follows `QuestionStatus` enum.
    *   On Mobile: Wrap grid in Shadcn `<Sheet>` triggered by a floating sticky bar.

### 5.2 Print & Export (CSS `@media print`)
*   Hide `HeaderBar`, `ActionBar`, and `PaletteDrawer`.
*   Render all questions sequentially as a list.
*   Display User Answer vs Correct Answer.
*   Page breaks inside question blocks should be avoided (`page-break-inside: avoid;`).

### 4.4 Remote JSON Loading (`src/composables/useRemoteQuiz.ts`)
*   **Trigger:** Called from `HomeView.vue` on mount when `route.query.test` is present.
*   **Signature:** `useRemoteQuiz()` returns `{ isLoading, fetchError, loadFromUrl }`.
*   **`loadFromUrl(url: string): Promise<QuizConfig | null>`:**
    1.  Validate the URL is a non-empty string starting with `http://` or `https://`. Reject and set `fetchError` if not.
    2.  Call `fetch(url)`. On network failure, set `fetchError` with a user-friendly message.
    3.  On non-OK HTTP status (e.g., 404, 403), set `fetchError` with the status code.
    4.  Parse the response JSON. On parse failure, set `fetchError`.
    5.  Validate that the parsed object has a `questions` array. On failure, set `fetchError`.
    6.  On success, return the `QuizConfig`. Set `isLoading = false`.
*   **`HomeView.vue` Integration:**
    *   Import `useRoute` from `vue-router` and call `const route = useRoute()`.
    *   In `onMounted`, check `route.query.test`. If it is a non-empty string, call `loadFromUrl()` from the `useRemoteQuiz` composable.
    *   While loading, render a full-width loading banner (spinner + "Loading quiz from URL…") replacing the upload card.
    *   On error, render a dismissible error alert card with the `fetchError` message and show the normal upload UI.
    *   On success, populate `quizData` and `fileName` (derived from URL), then pre-fill `duration` from the loaded config.

## 6. Implementation Steps for AI
1. Initialize Vite Vue 3 project with Tailwind and TS.
2. Install dependencies: `pinia pinia-plugin-persistedstate vue-router markdown-it katex lucide-vue-next`.
3. Scaffold Shadcn-vue and generate UI components (Button, Sheet, Card, RadioGroup).
4. Implement `types/index.ts` and `stores/testSession.ts`.
5. Implement routing and views (`HomeView`, `TestView`, `ResultView`).
6. Build Layout components (`HeaderBar`, `PaletteDrawer`, `ActionBar`).
7. Build `QuestionDisplay` with markdown/katex integration.
8. Wire state management, scoring, and print styles.
9. Implement `useRemoteQuiz.ts` and integrate `?test=<URL>` loading in `HomeView.vue`.
