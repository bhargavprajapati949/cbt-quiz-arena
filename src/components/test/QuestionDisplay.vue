<script setup lang="ts">
import { computed, watch } from 'vue'
import { useTestSessionStore } from '@/stores/testSession'
import MarkdownIt from 'markdown-it'
import katex from 'katex'
import DOMPurify from 'dompurify'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const store = useTestSessionStore()

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})

const renderKatex = (text: string): string => {
  // Render display math: $$...$$
  let result = text.replace(/\$\$([\s\S]*?)\$\$/g, (_match, math: string) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: true, throwOnError: false })
    } catch {
      return `<span class="text-red-500">[Math Error]</span>`
    }
  })
  // Render inline math: $...$
  result = result.replace(/\$([^$\n]+?)\$/g, (_match, math: string) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false })
    } catch {
      return `<span class="text-red-500">[Math Error]</span>`
    }
  })
  return result
}

const currentQuestion = computed(() => {
  return store.questions[store.currentIndex] ?? null
})

const currentAttempt = computed(() => {
  if (!currentQuestion.value) return null
  return store.attempts[currentQuestion.value.id] ?? null
})

const renderedQuestion = computed(() => {
  if (!currentQuestion.value) return ''
  const withKatex = renderKatex(currentQuestion.value.question)
  const html = md.render(withKatex)
  return DOMPurify.sanitize(html)
})

const optionEntries = computed(() => {
  if (!currentQuestion.value) return []
  const entries = Object.entries(currentQuestion.value.options)
  // Add "Other" option for MCQ questions
  if (entries.length > 0) {
    entries.push(['OTHER', 'Other (Write Answer)'])
  }
  return entries
})

const isSubjective = computed(() => {
  return currentQuestion.value ? Object.keys(currentQuestion.value.options).length === 0 : false
})

const showTextarea = computed(() => {
  if (!currentAttempt.value) return false
  return isSubjective.value || currentAttempt.value.selectedOption === 'OTHER'
})

const selectedOption = computed({
  get: () => currentAttempt.value?.selectedOption ?? '',
  set: (val: string) => {
    if (currentAttempt.value) {
      currentAttempt.value.selectedOption = val || null
      // Clear text response if switching away from OTHER
      if (val !== 'OTHER' && !isSubjective.value) {
        currentAttempt.value.textResponse = null
      }
    }
  }
})

const textResponse = computed({
  get: () => currentAttempt.value?.textResponse ?? '',
  set: (val: string) => {
    if (currentAttempt.value) {
      currentAttempt.value.textResponse = val || null
    }
  }
})

// Render option text that might contain KaTeX
const renderOptionText = (text: string): string => {
  const withKatex = renderKatex(text)
  return DOMPurify.sanitize(withKatex)
}

// Watch for question changes to ensure attempt exists
watch(() => store.currentIndex, () => {
  // Attempt should already exist from initialization
}, { immediate: true })
</script>

<template>
  <div
    v-if="currentQuestion"
    class="flex-1 overflow-y-auto p-4 sm:p-6"
  >
    <!-- Question Header -->
    <div class="mb-4">
      <div class="flex items-center gap-2 mb-3">
        <span class="inline-flex items-center justify-center h-7 w-auto min-w-[28px] px-2 rounded-md bg-primary text-primary-foreground text-sm font-bold">
          Q{{ store.currentIndex + 1 }}
        </span>
        <span class="text-xs text-muted-foreground">
          of {{ store.questions.length }}
        </span>
      </div>

      <!-- eslint-disable-next-line vue/no-v-html -->
      <div
        class="prose prose-sm max-w-none"
        v-html="renderedQuestion"
      />
    </div>

    <!-- MCQ Options -->
    <div
      v-if="!isSubjective"
      class="mt-6"
    >
      <RadioGroup
        v-model="selectedOption"
        class="space-y-3"
      >
        <Label
          v-for="[key, value] in optionEntries"
          :key="key"
          :for="`option-${key}`"
          class="flex items-start space-x-3 rounded-lg border p-3 transition-colors hover:bg-accent/50 cursor-pointer font-normal leading-relaxed"
          :class="selectedOption === key ? 'border-primary bg-primary/5' : 'border-border'"
        >
          <RadioGroupItem
            :id="`option-${key}`"
            :value="key"
            class="mt-0.5"
          />
          <span class="flex-1">
            <span class="font-semibold mr-2">{{ key }}.</span>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span v-html="renderOptionText(value)" />
          </span>
        </Label>
      </RadioGroup>
    </div>

    <!-- Textarea for Subjective or OTHER -->
    <div
      v-if="showTextarea"
      class="mt-4"
    >
      <Label class="text-sm font-medium text-muted-foreground mb-2 block">
        {{ isSubjective ? 'Write your answer below:' : 'Enter your custom answer:' }}
      </Label>
      <Textarea
        v-model="textResponse"
        :placeholder="isSubjective ? 'Type your answer here...' : 'Type your custom answer here...'"
        class="w-full h-32 resize-y"
      />
    </div>
  </div>
</template>
