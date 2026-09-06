import { defineStore } from 'pinia';
import { ref } from 'vue';
import 'pinia-plugin-persistedstate';
import type { RawQuestion, AttemptRecord } from '../types';

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

  const clearSession = () => {
    isActive.value = false;
    isCompleted.value = false;
    config.value = { duration: 0, enableNegativeMarking: false };
    questions.value = [];
    attempts.value = {};
    currentIndex.value = 0;
    timeRemainingSec.value = 0;
  };

  return {
    isActive,
    isCompleted,
    config,
    questions,
    attempts,
    currentIndex,
    timeRemainingSec,
    clearSession
  };
}, {
  persist: true
});
