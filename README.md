# 📝 CBT Quiz Arena

A **Computer Based Test (CBT) simulator** that runs entirely in your browser — no servers, no sign-ups, no internet required after the first load. Upload a quiz file, take the test under timed conditions, and review your results instantly.

Built to match the style of Gujarat Government exam portals (GSSSB, GPSSB, etc.), this tool is perfect for self-study, mock tests, and classroom practice.

---

## 🌐 Live Demo

You don't need to install anything to try it! The app is hosted live on GitHub Pages:
**👉 [Play CBT Quiz Arena](https://bhargavprajapati949.github.io/cbt-quiz-arena)**

---

## ✨ Features

### 🏠 Home Screen
- **Upload a Quiz** — Drag-and-drop or browse to load a `.json` quiz file.
- **Set Duration** — The timer auto-fills from your JSON file, but you can change it to any number of minutes.
- **Negative Marking** — Toggle this ON if you want `-0.25` penalty for wrong MCQ answers.
- **AI Prompt Generator** — Copy a ready-made prompt to generate quiz JSON files using ChatGPT, Gemini, or any AI assistant.

### 📋 Test Interface
- **Realistic CBT Layout** — Question panel on the left, navigation palette on the right (or in a drawer on mobile).
- **Question Types Supported:**
  - ✅ Multiple Choice (2, 4, or any number of options)
  - ✅ Subjective / Written (text area for long answers)
  - ✅ "Other" option (always appended to MCQs for custom answers)
- **Rich Content** — Questions can include **bold text**, *italics*, math equations ($x^2 + y^2 = z^2$), and Gujarati language (ગુજરાતી).
- **Action Buttons:**
  - **Save & Next** — Saves your answer and moves forward.
  - **Save & Mark for Review** — Saves your answer, flags it for review, and moves forward.
  - **Mark for Review & Next** — Flags the question (does NOT save your answer) and moves forward.
  - **Clear Response** — Removes your selected answer.
- **Navigation Palette** — Color-coded question grid:
  - ⬜ White — Not yet visited
  - 🟥 Red — Visited but not answered
  - 🟩 Green — Answered
  - 🟪 Purple — Marked for review (no answer saved)
  - 🟪🟢 Purple with green dot — Answered AND marked for review
- **Countdown Timer** — Visible at all times. Auto-submits when time runs out.

### 📊 Result Page
- **Score Summary** — Total score, correct, incorrect, unattempted, and pending grading counts at a glance.
- **Question-wise Review** — Every question is shown with all options:
  - ✅ Your correct answer → Green background with check icon
  - ❌ Your wrong answer → Red background with cross icon, correct answer shown with dashed green outline
  - ⬜ Unattempted → "Unattempted" badge, correct answer shown with dashed green outline
  - 📝 Subjective / Other → Your written response displayed in a styled text panel
- **Quick Grading (for Subjective & "Other"):**
  - One-click **❌ Incorrect** button (assigns 0 or -0.25)
  - One-click **✅ Correct** button (assigns 1.0 mark)
  - **Partial** marks input (e.g., 0.5) — updates the total score instantly
- **Download PDF** — Print-optimized result page, one click to save as PDF.
- **Exit to Home** — Clears your session and starts fresh.

### 💾 Session Recovery
- Your test progress is **automatically saved** in the browser.
- If you close the tab or your browser crashes, just reopen the app.
- A popup will ask: **Resume your test** or **Discard and start new**.
- Resuming restores your exact answers, question position, and remaining time — no need to re-upload the quiz file.

---

## 🚀 Getting Started

### 1. Run the App

```bash
# Install dependencies (first time only)
npm install

# Start the app
npm run dev
```

Open the URL shown in your terminal (usually `http://localhost:5173`).

### 2. Load a Quiz

Use the included **demo quiz file** to try it out:

1. Open the app in your browser.
2. Click the upload area (or drag-and-drop) and select [`quiz.json`](quiz.json) from the project root.
3. Adjust the timer duration if needed.
4. Optionally enable negative marking.
5. Click **Start Test**.

---

## 📄 Quiz File Format

Your quiz file must be a `.json` file with this structure:

```json
{
  "duration": 60,
  "questions": [
    {
      "id": 1,
      "question": "Your question text here",
      "options": {
        "A": "First option",
        "B": "Second option",
        "C": "Third option",
        "D": "Fourth option"
      },
      "answer": "B"
    }
  ]
}
```

### Field Reference

| Field | Required | Description |
|-------|----------|-------------|
| `duration` | Yes | Test duration in **minutes** (e.g., `60` for 1 hour) |
| `questions` | Yes | Array of question objects |
| `questions[].id` | Yes | Unique identifier (number or text) |
| `questions[].question` | Yes | The question text. Supports **Markdown**, **KaTeX math** (`$...$` for inline, `$$...$$` for display), and **Gujarati/Unicode** |
| `questions[].options` | Yes | An object with option keys and values. Use `{}` (empty) for subjective questions |
| `questions[].answer` | Yes | The correct option key (e.g., `"B"`). Use `""` (empty string) for subjective questions |

### Question Types

#### Multiple Choice (4 options)
```json
{
  "id": 1,
  "question": "What is 2 + 2?",
  "options": {
    "A": "3",
    "B": "4",
    "C": "5",
    "D": "6"
  },
  "answer": "B"
}
```

#### Multiple Choice (2 options)
```json
{
  "id": 2,
  "question": "Is the Earth round?",
  "options": {
    "A": "Yes",
    "B": "No"
  },
  "answer": "A"
}
```

#### Subjective / Written Answer
```json
{
  "id": 3,
  "question": "Explain photosynthesis in your own words.",
  "options": {},
  "answer": ""
}
```

#### Math Equations (using KaTeX)
```json
{
  "id": 4,
  "question": "Solve for $x$: $$2x + 4 = 10$$",
  "options": {
    "A": "$x = 2$",
    "B": "$x = 3$",
    "C": "$x = 4$",
    "D": "$x = 5$"
  },
  "answer": "B"
}
```
- Use `$...$` for inline math (e.g., `$x^2$`)
- Use `$$...$$` for display/block math (e.g., `$$\frac{a}{b}$$`)

#### Gujarati Language
```json
{
  "id": 5,
  "question": "ગુજરાતનું પાટનગર કયું છે?",
  "options": {
    "A": "અમદાવાદ",
    "B": "ગાંધીનગર"
  },
  "answer": "B"
}
```

---

## 🤖 Generate Questions Using AI

You don't have to write the JSON by hand! Use any AI assistant (ChatGPT, Gemini, Claude, etc.) with a prompt like this:

> Generate a JSON quiz file with 20 questions about Indian History for a competitive exam. The JSON should have a `"duration"` field set to 30 (minutes) and a `"questions"` array. Each question object must have: `"id"` (unique number), `"question"` (the question text — you can use Markdown and KaTeX for math), `"options"` (object with keys like "A", "B", "C", "D" and their text values; use `{}` for subjective questions), and `"answer"` (the correct option key like "B", or `""` for subjective). Include 2 subjective questions at the end.

The app also has a built-in **AI Prompt Generator** on the home screen — just click "Copy Prompt" and paste it into your favorite AI tool.

---

## 📂 Demo Quiz File

A ready-to-use quiz file is included at [`quiz.json`](quiz.json) in the project root. It contains **15 questions** covering:

- 🌍 General Knowledge (English)
- 📐 Mathematics with KaTeX equations
- 🇮🇳 Gujarati language questions (ગુજરાતી)
- ✍️ Subjective / written answer questions
- 🔢 Questions with 2 and 4 options

Load this file to explore all the features of the simulator.

---

## 🔒 Privacy

Everything runs **100% in your browser**. Your quiz data, answers, and scores never leave your device. No data is sent to any server.

---

## 📜 License

This project is open source.
