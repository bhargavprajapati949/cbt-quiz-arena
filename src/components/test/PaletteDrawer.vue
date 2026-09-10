<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTestSessionStore } from '@/stores/testSession'
import { useCbtEngine } from '@/composables/useCbtEngine'
import { QuestionStatus } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import SubmitConfirmationDialog from '@/components/test/SubmitConfirmationDialog.vue'
import { LayoutGrid, Send } from 'lucide-vue-next'

const store = useTestSessionStore()
const { goToQuestion } = useCbtEngine()
const isSheetOpen = ref(false)

const statusColorMap: Record<string, string> = {
  [QuestionStatus.NOT_VISITED]: 'bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-500 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-600',
  [QuestionStatus.NOT_ANSWERED]: 'bg-red-500 border-red-600 text-white hover:bg-red-600',
  [QuestionStatus.ANSWERED]: 'bg-green-500 border-green-600 text-white hover:bg-green-600',
  [QuestionStatus.MARKED_FOR_REVIEW]: 'bg-purple-500 border-purple-600 text-white hover:bg-purple-600',
  [QuestionStatus.ANSWERED_AND_MARKED]: 'bg-purple-500 border-purple-600 text-white hover:bg-purple-600',
}

const statusCounts = computed(() => {
  const counts = {
    answered: 0,
    notAnswered: 0,
    notVisited: 0,
    markedForReview: 0,
    answeredAndMarked: 0,
  }
  for (const q of store.questions) {
    const attempt = store.attempts[q.id]
    if (!attempt) continue
    switch (attempt.status) {
      case QuestionStatus.ANSWERED: counts.answered++; break
      case QuestionStatus.NOT_ANSWERED: counts.notAnswered++; break
      case QuestionStatus.NOT_VISITED: counts.notVisited++; break
      case QuestionStatus.MARKED_FOR_REVIEW: counts.markedForReview++; break
      case QuestionStatus.ANSWERED_AND_MARKED: counts.answeredAndMarked++; break
    }
  }
  return counts
})

const handleQuestionClick = (index: number) => {
  goToQuestion(index)
  isSheetOpen.value = false
}

const openSubmitDialog = () => {
  store.isSubmitDialogOpen = true
  isSheetOpen.value = false
}
</script>

<template>
  <!-- Global Submit Dialog (rendered once, outside both desktop/mobile layouts) -->
  <SubmitConfirmationDialog />

  <!-- Desktop Sidebar -->
  <aside class="no-print hidden lg:flex lg:flex-col lg:w-72 border-l bg-background overflow-hidden">
    <div class="p-4 border-b shrink-0">
      <h3 class="text-sm font-semibold text-muted-foreground mb-3">
        Question Palette
      </h3>

      <!-- Status Legend -->
      <div class="grid grid-cols-2 gap-1.5 text-xs">
        <div class="flex items-center gap-1.5">
          <span class="inline-block w-3 h-3 rounded-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-500" />
          Not Visited ({{ statusCounts.notVisited }})
        </div>
        <div class="flex items-center gap-1.5">
          <span class="inline-block w-3 h-3 rounded-sm bg-red-500" />
          Not Answered ({{ statusCounts.notAnswered }})
        </div>
        <div class="flex items-center gap-1.5">
          <span class="inline-block w-3 h-3 rounded-sm bg-green-500" />
          Answered ({{ statusCounts.answered }})
        </div>
        <div class="flex items-center gap-1.5">
          <span class="inline-block w-3 h-3 rounded-sm bg-purple-500" />
          Marked ({{ statusCounts.markedForReview }})
        </div>
        <div class="flex items-center gap-1.5">
          <span class="relative inline-block w-3 h-3 rounded-sm bg-purple-500">
            <span class="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-green-400 rounded-full" />
          </span>
          Ans. &amp; Marked ({{ statusCounts.answeredAndMarked }})
        </div>
      </div>
    </div>

    <!-- Question Grid (scrollable) -->
    <div class="flex-1 overflow-y-auto p-4">
      <div class="grid grid-cols-5 gap-2">
        <button
          v-for="(q, index) in store.questions"
          :key="q.id"
          class="relative w-10 h-10 rounded-md border text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
          :class="[
            statusColorMap[store.attempts[q.id]?.status ?? QuestionStatus.NOT_VISITED],
            index === store.currentIndex ? 'ring-2 ring-blue-500 ring-offset-1' : ''
          ]"
          @click="handleQuestionClick(index)"
        >
          {{ index + 1 }}
          <span
            v-if="store.attempts[q.id]?.status === QuestionStatus.ANSWERED_AND_MARKED"
            class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border border-white"
          />
        </button>
      </div>
    </div>

    <!-- Submit Button (sticky at bottom of sidebar) -->
    <div class="p-4 border-t shrink-0">
      <Button
        class="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
        @click="openSubmitDialog"
      >
        <Send class="h-4 w-4" />
        Submit Test
      </Button>
    </div>
  </aside>

  <!-- Mobile Sheet -->
  <div class="lg:hidden no-print">
    <Sheet v-model:open="isSheetOpen">
      <SheetTrigger as-child>
        <Button
          class="fixed bottom-20 right-4 z-50 rounded-full h-12 w-12 shadow-lg bg-blue-600 hover:bg-blue-700 text-white"
        >
          <LayoutGrid class="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        class="h-[75vh] flex flex-col"
      >
        <SheetHeader>
          <SheetTitle>Question Palette</SheetTitle>
        </SheetHeader>
        <div class="flex-1 overflow-y-auto mt-4">
          <!-- Status Legend Mobile -->
          <div class="grid grid-cols-2 gap-1.5 text-xs mb-4">
            <div class="flex items-center gap-1.5">
              <span class="inline-block w-3 h-3 rounded-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-500" />
              Not Visited ({{ statusCounts.notVisited }})
            </div>
            <div class="flex items-center gap-1.5">
              <span class="inline-block w-3 h-3 rounded-sm bg-red-500" />
              Not Answered ({{ statusCounts.notAnswered }})
            </div>
            <div class="flex items-center gap-1.5">
              <span class="inline-block w-3 h-3 rounded-sm bg-green-500" />
              Answered ({{ statusCounts.answered }})
            </div>
            <div class="flex items-center gap-1.5">
              <span class="inline-block w-3 h-3 rounded-sm bg-purple-500" />
              Marked ({{ statusCounts.markedForReview }})
            </div>
            <div class="flex items-center gap-1.5">
              <span class="relative inline-block w-3 h-3 rounded-sm bg-purple-500">
                <span class="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-green-400 rounded-full" />
              </span>
              Ans. &amp; Marked ({{ statusCounts.answeredAndMarked }})
            </div>
          </div>

          <!-- Grid -->
          <div class="grid grid-cols-6 gap-2 mb-4">
            <button
              v-for="(q, index) in store.questions"
              :key="q.id"
              class="relative w-10 h-10 rounded-md border text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
              :class="[
                statusColorMap[store.attempts[q.id]?.status ?? QuestionStatus.NOT_VISITED],
                index === store.currentIndex ? 'ring-2 ring-blue-500 ring-offset-1' : ''
              ]"
              @click="handleQuestionClick(index)"
            >
              {{ index + 1 }}
              <span
                v-if="store.attempts[q.id]?.status === QuestionStatus.ANSWERED_AND_MARKED"
                class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border border-white"
              />
            </button>
          </div>
        </div>

        <!-- Submit (sticky at bottom of sheet) -->
        <div class="pt-3 border-t shrink-0">
          <Button
            class="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
            @click="openSubmitDialog"
          >
            <Send class="h-4 w-4" />
            Submit Test
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  </div>
</template>
