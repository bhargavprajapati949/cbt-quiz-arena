import { ref, onUnmounted } from 'vue';
import { useTestSessionStore } from '../stores/testSession';
import { useRouter } from 'vue-router';

export function useTimer() {
  const store = useTestSessionStore();
  const router = useRouter();
  const timer = ref<number | null>(null);

  const startTimer = () => {
    if (timer.value) clearInterval(timer.value);
    
    if (store.isActive && !store.isCompleted) {
      if (store.timeRemainingSec <= 0) {
        submitTest();
        return;
      }
      
      timer.value = window.setInterval(() => {
        if (store.timeRemainingSec > 0) {
          store.timeRemainingSec--;
        } else {
          stopTimer();
          submitTest();
        }
      }, 1000);
    }
  };

  const stopTimer = () => {
    if (timer.value) {
      clearInterval(timer.value);
      timer.value = null;
    }
  };

  const submitTest = () => {
    store.isCompleted = true;
    router.push('/result');
  };

  onUnmounted(() => {
    stopTimer();
  });

  return {
    startTimer,
    stopTimer,
    submitTest
  };
}
