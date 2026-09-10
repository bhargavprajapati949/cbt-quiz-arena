<script setup lang="ts">
import { useTestSessionStore } from '@/stores/testSession'
import { useTimer } from '@/composables/useTimer'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, Clock, HelpCircle, Send, ArrowLeft } from 'lucide-vue-next'

const store = useTestSessionStore()
const { submitTest } = useTimer()

const handleFinalSubmit = () => {
  store.isSubmitDialogOpen = false
  submitTest()
}

const handleReturn = () => {
  store.isSubmitDialogOpen = false
}
</script>

<template>
  <Dialog
    :open="store.isSubmitDialogOpen"
    @update:open="store.isSubmitDialogOpen = $event"
  >
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2 text-lg">
          <Send class="h-5 w-5 text-primary" />
          Submit Test?
        </DialogTitle>
        <DialogDescription class="text-sm text-muted-foreground">
          Please review your progress before final submission. This action cannot be undone.
        </DialogDescription>
      </DialogHeader>

      <!-- Session Stats Grid -->
      <div class="grid grid-cols-2 gap-3 py-2">
        <div class="flex items-center gap-3 rounded-lg border bg-green-50 dark:bg-green-950/30 p-3">
          <CheckCircle2 class="h-6 w-6 text-green-600 dark:text-green-400 shrink-0" />
          <div>
            <p class="text-2xl font-bold text-green-700 dark:text-green-300 leading-none">
              {{ store.sessionStats.answered }}
            </p>
            <p class="text-xs text-green-600 dark:text-green-400 mt-0.5">
              Answered
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3 rounded-lg border bg-red-50 dark:bg-red-950/30 p-3">
          <XCircle class="h-6 w-6 text-red-500 dark:text-red-400 shrink-0" />
          <div>
            <p class="text-2xl font-bold text-red-600 dark:text-red-300 leading-none">
              {{ store.sessionStats.unattempted }}
            </p>
            <p class="text-xs text-red-500 dark:text-red-400 mt-0.5">
              Unattempted
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3 rounded-lg border bg-purple-50 dark:bg-purple-950/30 p-3">
          <HelpCircle class="h-6 w-6 text-purple-600 dark:text-purple-400 shrink-0" />
          <div>
            <p class="text-2xl font-bold text-purple-700 dark:text-purple-300 leading-none">
              {{ store.sessionStats.markedForReview }}
            </p>
            <p class="text-xs text-purple-600 dark:text-purple-400 mt-0.5">
              Marked for Review
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
          <Clock class="h-6 w-6 text-muted-foreground shrink-0" />
          <div>
            <p class="text-2xl font-bold text-foreground leading-none">
              {{ store.sessionStats.notVisited }}
            </p>
            <p class="text-xs text-muted-foreground mt-0.5">
              Not Visited
            </p>
          </div>
        </div>
      </div>

      <DialogFooter class="flex-col sm:flex-row gap-2 pt-2">
        <Button
          variant="outline"
          class="w-full sm:w-auto gap-2"
          @click="handleReturn"
        >
          <ArrowLeft class="h-4 w-4" />
          Return to Test
        </Button>
        <Button
          class="w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          @click="handleFinalSubmit"
        >
          <Send class="h-4 w-4" />
          Final Submit
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
