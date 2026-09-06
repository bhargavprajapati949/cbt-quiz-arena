<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useCbtEngine } from '@/composables/useCbtEngine'
import { Save, Flag, SkipForward, Eraser } from 'lucide-vue-next'

const { saveAndNext, saveAndMarkForReview, markForReviewAndNext, clearResponse } = useCbtEngine()
</script>

<template>
  <div class="no-print sticky bottom-0 z-40 border-t bg-white p-3 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
    <div class="flex flex-wrap items-center justify-center gap-2">
      <Button
        class="bg-green-600 hover:bg-green-700 text-white gap-1.5"
        @click="saveAndNext"
      >
        <Save class="h-4 w-4" />
        <span class="hidden sm:inline">Save &amp; Next</span>
        <span class="sm:hidden">Save</span>
      </Button>

      <Button
        class="bg-purple-600 hover:bg-purple-700 text-white gap-1.5"
        @click="saveAndMarkForReview"
      >
        <Flag class="h-4 w-4" />
        <span class="hidden sm:inline">Save &amp; Mark for Review</span>
        <span class="sm:hidden">Save+Mark</span>
      </Button>

      <Button
        variant="outline"
        class="border-purple-400 text-purple-600 hover:bg-purple-50 gap-1.5"
        @click="markForReviewAndNext"
      >
        <SkipForward class="h-4 w-4" />
        <span class="hidden sm:inline">Mark for Review &amp; Next</span>
        <span class="sm:hidden">Mark</span>
      </Button>

      <Button
        variant="outline"
        class="border-red-400 text-red-600 hover:bg-red-50 gap-1.5"
        @click="clearResponse"
      >
        <Eraser class="h-4 w-4" />
        <span class="hidden sm:inline">Clear Response</span>
        <span class="sm:hidden">Clear</span>
      </Button>
    </div>
  </div>
</template>
