# Product Requirements Document (PRD): Static CBT Simulator (Gujarat Govt Style)
**Target Audience / Persona for this doc:** AI Coding Assistant (GitHub Copilot / Cursor)
**Project Goal:** Build a stateless, responsive, client-side web application for simulating Computer Based Tests (CBT) matching Gujarat Government exam portals (e.g., GSSSB, GPSSB). 

---

## 1. System Architecture & Tech Stack Guidelines
*   **Architecture:** 100% Client-side, stateless SPA (Single Page Application). No backend.
*   **Storage:** Browser `localStorage` (or `IndexedDB` for large JSONs) for session persistence.
*   **Content Rendering:** Must support Markdown, Math equations (KaTeX/MathJax), and native UTF-8 (Gujarati language).
*   **Export:** Browser-native Print-to-PDF (`window.print()` formatted via CSS `@media print`).

---

## 2. Data Architecture (JSON Schema)
The application ingests quizzes via a JSON file. 

```json
{
  "duration": 60, 
  "questions": [
    {
      "id": 1,
      "question": "Solve for $x$:  $2x + 4 = 8$",
      "options": {
        "A": "1",
        "B": "2",
        "C": "3",
        "D": "4"
      },
      "answer": "B"
    },
    {
      "id": 2,
      "question": "ગુજરાતનું પાટનગર કયું છે?",
      "options": {
        "A": "અમદાવાદ",
        "B": "ગાંધીનગર"
      },
      "answer": "B"
    },
    {
      "id": 3,
      "question": "દાંડી કૂચ વિશે ટૂંકનોંધ લખો.",
      "options": {}, 
      "answer": "" 
    }
  ]
}
```
*Note for AI:* `options` size is dynamic (0 to N). If 0, it is a subjective question.

---

## 3. Core Features & User Journey

### 3.1 Homepage & Configuration
*   **Importer:** Drag-and-drop or file input for the JSON file.
*   **Duration Input:** Numeric (minutes). Auto-populates from JSON `duration` if present.
*   **Scoring Config:** Checkbox: "Enable Negative Marking" (Default: Unchecked).
    *   *Checked:* Correct = +1, Incorrect = -0.25, Unattempted/Subjective = 0.
    *   *Unchecked:* Correct = +1, Incorrect = 0, Unattempted/Subjective = 0.
*   **AI Prompt Generator:** Display a copyable prompt for users to generate compatible JSON files using LLMs.

### 3.2 CBT Engine Interface (The Test)
*   **Layout:** 
    *   Desktop: Question Panel (Left), Navigation Palette (Right).
    *   Mobile: Navigation Palette in a toggleable drawer/bottom sheet.
*   **Question Panel:**
    *   Render `question` text (Markdown + KaTeX + Gujarati).
    *   Render $N$ options based on JSON.
    *   **Always append a final option:** "Other".
    *   If "Other" is selected, or if `options` is empty (Subjective), reveal a `<textarea>` for notes/answers.
*   **Bottom Action Bar:**
    1.  **Save & Next:** Saves selection -> advances index.
    2.  **Save & Mark for Review:** Saves selection -> flags as review -> advances index. (Evaluated for scoring).
    3.  **Mark for Review & Next:** Does NOT save selection -> flags as review -> advances index.
    4.  **Clear Response:** Clears radio selection and textarea.

### 3.3 Question Palette (Navigation Grid)
*   **Behavior:** Unrestricted navigation. Clicking a number jumps to that question.
*   **State Color Coding (Strict CBT Standard):**
    *   ⬜ *White:* Not Visited.
    *   🟥 *Red:* Visited but Not Answered.
    *   🟩 *Green:* Answered (not marked for review).
    *   🟪 *Purple:* Marked for Review (No answer saved).
    *   🟪🟢 *Purple with Green Dot:* Answered & Marked for Review (Will be evaluated).
*   **Timer:** Fixed top-right countdown. Force auto-submit at `00:00:00`.

---

## 4. State Management & Resiliency
*   **Cache on Start:** Deep copy the parsed JSON and test config into `localStorage` upon clicking "Start".
*   **Auto-Save:** Sync state to `localStorage` on every user action (option click, text input, timer tick).
*   **Crash Recovery Flow:** 
    *   On Homepage load, check `localStorage`.
    *   If active session found, display: "In-progress session detected. Time remaining: XX:XX."
    *   Buttons: [Resume Test] | [Discard & Start New].
    *   Resuming must restore exact state, answers, and timer without needing the original JSON file.

---

## 5. Result Page & Export
*   **Scoring Engine:** 
    *   Evaluate MCQs based on config.
    *   "Other" selections and Subjective questions default to 0 marks (Unattempted).
*   **Summary Dashboard:** Total Score, Attempted, Correct, Incorrect, Unattempted. Show "Pending Grading" if subjective questions exist.
*   **Question-wise Review List:**
    *   Display: Question, Correct Answer, User Answer (Option text or textarea content).
    *   **Manual Grading UI:** For subjective/"Other" responses, show a numeric input allowing the user to manually award themselves marks (e.g., 0.5, 1). Updating this must dynamically update the Summary Dashboard's Total Score.
*   **Export:** "Download Result" button triggering CSS-optimized print-to-PDF.
*   **Cleanup:** "Exit to Home" button clears `localStorage` and resets the app.
