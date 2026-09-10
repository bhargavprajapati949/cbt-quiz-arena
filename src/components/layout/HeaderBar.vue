<script setup lang="ts">
import { computed } from 'vue'
import { useTestSessionStore } from '@/stores/testSession'
import { Button } from '@/components/ui/button'
import { Timer, User, FileText, Moon, Sun, LogOut } from 'lucide-vue-next'

const store = useTestSessionStore()

const formattedTime = computed(() => {
  const total = store.timeRemainingSec
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const isLowTime = computed(() => store.timeRemainingSec <= 300)

const toggleDarkMode = () => {
  store.isDarkMode = !store.isDarkMode
}

const openSubmitDialog = () => {
  store.isSubmitDialogOpen = true
}
</script>

<template>
  <header class="no-print sticky top-0 z-50 w-full border-b bg-background shadow-sm">
    <div class="flex h-14 items-center justify-between px-4 gap-2">
      <!-- Left: Profile -->
      <div class="flex items-center gap-2 shrink-0">
        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <User class="h-4 w-4" />
        </div>
        <span class="text-sm font-medium hidden sm:inline">Candidate</span>
      </div>

      <!-- Center: Title -->
      <div class="flex items-center gap-2 min-w-0">
        <FileText class="h-4 w-4 text-muted-foreground shrink-0" />
        <span class="text-sm font-semibold sm:text-base truncate">CBT Quiz Arena</span>
      </div>

      <!-- Right: Controls -->
      <div class="flex items-center gap-2 shrink-0">
        <!-- Timer (only shown during active test) -->
        <div
          v-if="store.isActive && !store.isCompleted"
          class="flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 transition-colors"
          :class="isLowTime
            ? 'border-red-500 bg-red-50 text-red-600 dark:bg-red-950/40 dark:border-red-600 dark:text-red-400'
            : 'border-border'"
        >
          <Timer class="h-4 w-4" />
          <span class="text-sm font-mono font-bold tabular-nums">{{ formattedTime }}</span>
        </div>

        <!-- End Test button – accessible to mobile users without opening the drawer -->
        <Button
          v-if="store.isActive && !store.isCompleted"
          variant="outline"
          size="sm"
          class="gap-1.5 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
          @click="openSubmitDialog"
        >
          <LogOut class="h-4 w-4" />
          <span class="hidden sm:inline">End Test</span>
        </Button>

        <!-- Dark Mode Toggle -->
        <Button
          variant="ghost"
          size="icon"
          class="h-9 w-9 rounded-md"
          :aria-label="store.isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleDarkMode"
        >
          <Sun
            v-if="store.isDarkMode"
            class="h-4 w-4"
          />
          <Moon
            v-else
            class="h-4 w-4"
          />
        </Button>
      </div>
    </div>
  </header>
</template>
