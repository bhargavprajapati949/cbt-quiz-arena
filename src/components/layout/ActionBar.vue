<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useCbtEngine } from '@/composables/useCbtEngine'
import { Save, Flag, SkipForward, Eraser, Send } from 'lucide-vue-next'

const { isLastQuestion, saveAndNext, saveAndMarkForReview, markForReviewAndNext, clearResponse } = useCbtEngine()
</script>

<template>
  <div class="no-print sticky bottom-0 z-40 border-t bg-background shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
    <div class="flex flex-wrap items-center justify-center gap-2 p-3">
      <!-- Save & Next / Save & Preview Submit (last question) -->
      <Button
        class="bg-green-600 hover:bg-green-700 text-white gap-1.5"
        @click="saveAndNext"
      >
        <template v-if="isLastQuestion">
          <Send class="h-4 w-4" />
          <span class="hidden sm:inline">Save &amp; Preview Submit</span>
          <span class="sm:hidden">Save</span>
        </template>
        <template v-else>
          <Save class="h-4 w-4" />
          <span class="hidden sm:inline">Save &amp; Next</span>
          <span class="sm:hidden">Save</span>
        </template>
      </Button>

      <!-- Save & Mark for Review (label unchanged on last question, no advance) -->
      <Button
        class="bg-purple-600 hover:bg-purple-700 text-white gap-1.5"
        @click="saveAndMarkForReview"
      >
        <Flag class="h-4 w-4" />
        <span class="hidden sm:inline">Save &amp; Mark for Review</span>
        <span class="sm:hidden">Save+Mark</span>
      </Button>

      <!-- Mark for Review & Next / Mark for Review (last question) -->
      <Button
        variant="outline"
        class="border-purple-400 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30 gap-1.5"
        @click="markForReviewAndNext"
      >
        <SkipForward class="h-4 w-4" />
        <span class="hidden sm:inline">
          {{ isLastQuestion ? 'Mark for Review' : 'Mark for Review &amp; Next' }}
        </span>
        <span class="sm:hidden">Mark</span>
      </Button>

      <!-- Clear Response -->
      <Button
        variant="outline"
        class="border-red-400 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 gap-1.5"
        @click="clearResponse"
      >
        <Eraser class="h-4 w-4" />
        <span class="hidden sm:inline">Clear Response</span>
        <span class="sm:hidden">Clear</span>
      </Button>
    </div>
  </div>
</template>
