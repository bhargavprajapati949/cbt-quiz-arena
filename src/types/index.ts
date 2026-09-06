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
export const QuestionStatus = {
  NOT_VISITED: 'white',
  NOT_ANSWERED: 'red',
  ANSWERED: 'green',
  MARKED_FOR_REVIEW: 'purple',
  ANSWERED_AND_MARKED: 'purple-green'
} as const;
export type QuestionStatus = typeof QuestionStatus[keyof typeof QuestionStatus];

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
