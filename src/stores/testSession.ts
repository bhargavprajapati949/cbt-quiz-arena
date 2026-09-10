import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import 'pinia-plugin-persistedstate';
import type { RawQuestion, AttemptRecord } from '../types';
import { QuestionStatus } from '../types';

export const useTestSessionStore = defineStore('testSession', () => {
  const isActive = ref<boolean>(false);
  const isCompleted = ref<boolean>(false);
  const config = ref<{ duration: number; enableNegativeMarking: boolean }>({
    duration: 0,
    enableNegativeMarking: false,
  });
  const questions = ref<RawQuestion[]>([]);
  const attempts = ref<Record<string | number, AttemptRecord>>({});
  const currentIndex = ref<number>(0);
  const timeRemainingSec = ref<number>(0);

  // Dark mode – persisted and synced to <html class="dark">
  const isDarkMode = ref<boolean>(
    localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  // Controls the global Submit Confirmation Dialog
  const isSubmitDialogOpen = ref<boolean>(false);

  // Sync dark class to document root whenever isDarkMode changes
  watch(isDarkMode, (val) => {
    document.documentElement.classList.toggle('dark', val);
    localStorage.setItem('theme', val ? 'dark' : 'light');
  }, { immediate: true });

  // Session stats – derived from current attempts
  const sessionStats = computed(() => {
    const counts = { answered: 0, unattempted: 0, markedForReview: 0, notVisited: 0 };
    for (const q of questions.value) {
      const attempt = attempts.value[q.id];
      if (!attempt) continue;
      switch (attempt.status) {
        case QuestionStatus.ANSWERED:
          counts.answered++;
          break;
        case QuestionStatus.ANSWERED_AND_MARKED:
          counts.answered++;
          counts.markedForReview++;
          break;
        case QuestionStatus.MARKED_FOR_REVIEW:
          counts.markedForReview++;
          counts.unattempted++;
          break;
        case QuestionStatus.NOT_ANSWERED:
          counts.unattempted++;
          break;
        case QuestionStatus.NOT_VISITED:
          counts.notVisited++;
          counts.unattempted++;
          break;
      }
    }
    return counts;
  });

  const clearSession = () => {
    isActive.value = false;
    isCompleted.value = false;
    config.value = { duration: 0, enableNegativeMarking: false };
    questions.value = [];
    attempts.value = {};
    currentIndex.value = 0;
    timeRemainingSec.value = 0;
    isSubmitDialogOpen.value = false;
  };

  return {
    isActive,
    isCompleted,
    config,
    questions,
    attempts,
    currentIndex,
    timeRemainingSec,
    isDarkMode,
    isSubmitDialogOpen,
    sessionStats,
    clearSession,
  };
}, {
  persist: {
    // Don't persist UI-only state; isDarkMode is handled via localStorage separately
    omit: ['isSubmitDialogOpen'],
  }
});
