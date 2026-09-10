<script setup lang="ts">
import { useTestSessionStore } from '@/stores/testSession'
import { Button } from '@/components/ui/button'
import { Moon, Sun, FileText } from 'lucide-vue-next'

defineProps<{
  title?: string
}>()

const store = useTestSessionStore()

const toggleDarkMode = () => {
  store.isDarkMode = !store.isDarkMode
}
</script>

<template>
  <header class="no-print sticky top-0 z-50 w-full border-b bg-background shadow-sm">
    <div class="container max-w-5xl mx-auto flex h-14 items-center justify-between px-4">
      <!-- Left: Title / Slot -->
      <div class="flex items-center gap-2 min-w-0">
        <FileText class="h-4 w-4 text-muted-foreground shrink-0" />
        <span class="text-sm font-semibold sm:text-base truncate">
          {{ title ?? 'CBT Quiz Arena' }}
        </span>
      </div>

      <!-- Right: Actions slot + dark mode toggle -->
      <div class="flex items-center gap-2 shrink-0">
        <slot name="actions" />

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
