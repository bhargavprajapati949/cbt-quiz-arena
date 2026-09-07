<script setup lang="ts">
import { computed } from 'vue'
import { useTestSessionStore } from '@/stores/testSession'
import { Timer, User, FileText } from 'lucide-vue-next'

const store = useTestSessionStore()

const formattedTime = computed(() => {
  const total = store.timeRemainingSec
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const isLowTime = computed(() => store.timeRemainingSec <= 300)
</script>

<template>
  <header class="no-print sticky top-0 z-50 w-full border-b bg-white shadow-sm">
    <div class="flex h-14 items-center justify-between px-4">
      <!-- Left: Profile -->
      <div class="flex items-center gap-2">
        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <User class="h-4 w-4" />
        </div>
        <span class="text-sm font-medium hidden sm:inline">Candidate</span>
      </div>

      <!-- Center: Title -->
      <div class="flex items-center gap-2">
        <FileText class="h-4 w-4 text-muted-foreground" />
        <span class="text-sm font-semibold sm:text-base">CBT Quiz Arena</span>
      </div>

      <!-- Right: Timer -->
      <div
        class="flex items-center gap-2 rounded-md border px-3 py-1.5"
        :class="isLowTime ? 'border-red-500 bg-red-50 text-red-600' : 'border-border'"
      >
        <Timer class="h-4 w-4" />
        <span class="text-sm font-mono font-bold tabular-nums">{{ formattedTime }}</span>
      </div>
    </div>
  </header>
</template>
