<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTestSessionStore } from '@/stores/testSession'
import { useTimer } from '@/composables/useTimer'
import HeaderBar from '@/components/layout/HeaderBar.vue'
import ActionBar from '@/components/layout/ActionBar.vue'
import QuestionDisplay from '@/components/test/QuestionDisplay.vue'
import PaletteDrawer from '@/components/test/PaletteDrawer.vue'

const store = useTestSessionStore()
const router = useRouter()
const { startTimer } = useTimer()

onMounted(() => {
  if (!store.isActive) {
    router.push('/')
    return
  }
  if (store.isCompleted) {
    router.push('/result')
    return
  }
  startTimer()
})
</script>

<template>
  <div class="flex flex-col h-[100dvh] bg-background">
    <HeaderBar />

    <div class="flex flex-1 overflow-hidden">
      <!-- Main Question Area -->
      <main class="flex-1 flex flex-col overflow-hidden">
        <QuestionDisplay />
        <ActionBar />
      </main>

      <!-- Desktop Palette Sidebar -->
      <PaletteDrawer />
    </div>
  </div>
</template>
