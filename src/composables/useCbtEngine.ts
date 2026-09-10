import { computed } from 'vue';
import { useTestSessionStore } from '../stores/testSession';
import { QuestionStatus, type QuizConfig, type AttemptRecord } from '../types';

export function useCbtEngine() {
  const store = useTestSessionStore();

  const isLastQuestion = computed(() => store.currentIndex === store.questions.length - 1);

  const getCurrentAttempt = (): AttemptRecord => {
    const q = store.questions[store.currentIndex];
    return store.attempts[q.id];
  };

  const clearUnsavedResponse = () => {
    const attempt = getCurrentAttempt();
    if (
      attempt.status === QuestionStatus.NOT_VISITED ||
      attempt.status === QuestionStatus.NOT_ANSWERED
    ) {
      attempt.selectedOption = null;
      attempt.textResponse = null;
    }
  };

  const advanceIndex = () => {
    clearUnsavedResponse();
    if (store.currentIndex < store.questions.length - 1) {
      store.currentIndex++;
      const nextQ = store.questions[store.currentIndex];
      const nextAttempt = store.attempts[nextQ.id];
      if (nextAttempt && nextAttempt.status === QuestionStatus.NOT_VISITED) {
        nextAttempt.status = QuestionStatus.NOT_ANSWERED;
      }
    }
  };

  const hasResponded = () => {
    const attempt = getCurrentAttempt();
    return (attempt.selectedOption !== null && attempt.selectedOption !== '') ||
           (attempt.textResponse !== null && attempt.textResponse.trim() !== '');
  };

  const saveAndNext = () => {
    const attempt = getCurrentAttempt();
    attempt.status = hasResponded() ? QuestionStatus.ANSWERED : QuestionStatus.NOT_ANSWERED;
    if (isLastQuestion.value) {
      // On the last question, open the submit dialog instead of advancing
      store.isSubmitDialogOpen = true;
    } else {
      advanceIndex();
    }
  };

  const saveAndMarkForReview = () => {
    const attempt = getCurrentAttempt();
    attempt.status = hasResponded() ? QuestionStatus.ANSWERED_AND_MARKED : QuestionStatus.MARKED_FOR_REVIEW;
    if (isLastQuestion.value) {
      store.isSubmitDialogOpen = true;
    } else {
      advanceIndex();
    }
  };

  const markForReviewAndNext = () => {
    const attempt = getCurrentAttempt();
    attempt.selectedOption = null;
    attempt.textResponse = null;
    attempt.status = QuestionStatus.MARKED_FOR_REVIEW;
    if (isLastQuestion.value) {
      store.isSubmitDialogOpen = true;
    } else {
      advanceIndex();
    }
  };

  const clearResponse = () => {
    const attempt = getCurrentAttempt();
    attempt.selectedOption = null;
    attempt.textResponse = null;
    attempt.status = QuestionStatus.NOT_ANSWERED;
  };

  const goToQuestion = (index: number) => {
    clearUnsavedResponse();
    if (index >= 0 && index < store.questions.length) {
      store.currentIndex = index;
      const targetQ = store.questions[index];
      const targetAttempt = store.attempts[targetQ.id];
      if (targetAttempt && targetAttempt.status === QuestionStatus.NOT_VISITED) {
        targetAttempt.status = QuestionStatus.NOT_ANSWERED;
      }
    }
  };

  const initializeTest = (config: QuizConfig, enableNegativeMarking: boolean) => {
    store.isActive = true;
    store.isCompleted = false;
    store.config = {
      duration: config.duration,
      enableNegativeMarking
    };
    store.questions = config.questions;

    const newAttempts: Record<string | number, AttemptRecord> = {};
    config.questions.forEach((q, index) => {
      newAttempts[q.id] = {
        questionId: q.id,
        selectedOption: null,
        textResponse: null,
        status: index === 0 ? QuestionStatus.NOT_ANSWERED : QuestionStatus.NOT_VISITED,
        manualScore: 0
      };
    });
    store.attempts = newAttempts;
    store.currentIndex = 0;
    store.timeRemainingSec = config.duration * 60;
  };

  const discardTest = () => {
    store.clearSession();
  };

  return {
    isLastQuestion,
    saveAndNext,
    saveAndMarkForReview,
    markForReviewAndNext,
    clearResponse,
    goToQuestion,
    initializeTest,
    discardTest,
  };
}
