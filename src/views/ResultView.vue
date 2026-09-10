<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTestSessionStore } from '@/stores/testSession'
import { useCbtEngine } from '@/composables/useCbtEngine'
import { QuestionStatus } from '@/types'
import MarkdownIt from 'markdown-it'
import katex from 'katex'
import DOMPurify from 'dompurify'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/layout/PageHeader.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Home, Printer, CheckCircle, XCircle, MinusCircle } from 'lucide-vue-next'

const store = useTestSessionStore()
const router = useRouter()
const { discardTest } = useCbtEngine()

const md = new MarkdownIt({ html: true, linkify: true })

const renderKatex = (text: string): string => {
  let result = text.replace(/\$\$([\s\S]*?)\$\$/g, (_m, math: string) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: true, throwOnError: false })
    } catch {
      return `<span class="text-red-500">[Math Error]</span>`
    }
  })
  result = result.replace(/\$([^$\n]+?)\$/g, (_m, math: string) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false })
    } catch {
      return `<span class="text-red-500">[Math Error]</span>`
    }
  })
  return result
}

const renderSafe = (text: string): string => {
  const withKatex = renderKatex(text)
  const html = md.render(withKatex)
  return DOMPurify.sanitize(html)
}

// Local ref tracking manual scores separately to trigger reactivity
const manualScores = ref<Record<string | number, number>>({})

// Initialize manual scores from store
for (const q of store.questions) {
  const attempt = store.attempts[q.id]
  if (attempt) {
    manualScores.value[q.id] = attempt.manualScore ?? 0
  }
}

const updateManualScore = (qId: string | number, value: string) => {
  const minScore = store.config.enableNegativeMarking ? -0.25 : 0
  const maxScore = 1
  const parsed = Math.min(maxScore, Math.max(minScore, parseFloat(value) || 0))
  manualScores.value[qId] = parsed
  const attempt = store.attempts[qId]
  if (attempt) {
    attempt.manualScore = parsed
  }
}

const scoringResult = computed(() => {
  let correct = 0
  let incorrect = 0
  let unattempted = 0
  let subjective = 0
  let manualTotal = 0

  for (const q of store.questions) {
    const attempt = store.attempts[q.id]
    if (!attempt) {
      unattempted++
      continue
    }

    const isSubjectiveQ = Object.keys(q.options).length === 0
    const isOther = attempt.selectedOption === 'OTHER'

    if (isSubjectiveQ || isOther) {
      subjective++
      manualTotal += manualScores.value[q.id] ?? 0
      continue
    }

    if (
      attempt.status === QuestionStatus.NOT_VISITED ||
      attempt.status === QuestionStatus.NOT_ANSWERED ||
      attempt.selectedOption === null ||
      attempt.selectedOption === ''
    ) {
      unattempted++
      continue
    }

    if (attempt.selectedOption === q.answer) {
      correct++
    } else {
      incorrect++
    }
  }

  const negPenalty = store.config.enableNegativeMarking ? -0.25 : 0
  const total = (correct * 1) + (incorrect * negPenalty) + manualTotal

  return {
    correct,
    incorrect,
    unattempted,
    subjective,
    manualTotal,
    total,
    maxMarks: store.questions.length,
  }
})

interface QuestionReview {
  index: number
  questionId: string | number
  questionText: string
  options: Record<string, string>
  correctAnswerKey: string
  selectedOptionKey: string | null
  isCorrect: boolean
  isSubjective: boolean
  isOther: boolean
  isUnattempted: boolean
  textResponse: string | null
}

const questionReviews = computed<QuestionReview[]>(() => {
  return store.questions.map((q, index) => {
    const attempt = store.attempts[q.id]
    const isSubjectiveQ = Object.keys(q.options).length === 0
    const isOther = attempt?.selectedOption === 'OTHER'
    const isUnattempted = !attempt ||
      attempt.selectedOption === null ||
      attempt.selectedOption === '' ||
      attempt.status === QuestionStatus.NOT_VISITED ||
      attempt.status === QuestionStatus.NOT_ANSWERED

    return {
      index,
      questionId: q.id,
      questionText: q.question,
      options: q.options,
      correctAnswerKey: q.answer,
      selectedOptionKey: attempt?.selectedOption ?? null,
      isCorrect: !isSubjectiveQ && !isOther && attempt?.selectedOption === q.answer,
      isSubjective: isSubjectiveQ,
      isOther,
      isUnattempted: isUnattempted && !isSubjectiveQ && !isOther,
      textResponse: attempt?.textResponse ?? null,
    }
  })
})

const quickGrade = (qId: string | number, score: number) => {
  updateManualScore(qId, String(score))
}

const handlePrint = () => {
  window.print()
}

const handleExit = () => {
  discardTest()
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Sticky header with dark mode toggle and result actions -->
    <PageHeader title="Test Results">
      <template #actions>
        <Button
          variant="outline"
          class="gap-1.5"
          @click="handlePrint"
        >
          <Printer class="h-4 w-4" />
          <span class="hidden sm:inline">Download PDF</span>
        </Button>
        <Button
          variant="outline"
          class="gap-1.5 text-red-600 border-red-300 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
          @click="handleExit"
        >
          <Home class="h-4 w-4" />
          <span class="hidden sm:inline">Exit to Home</span>
        </Button>
      </template>
    </PageHeader>

    <div class="container max-w-5xl mx-auto py-6 px-4">
      <!-- Score Summary Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <Card class="text-center">
          <CardContent class="pt-4 pb-3">
            <p class="text-2xl font-bold text-blue-600">
              {{ scoringResult.total.toFixed(2) }}
            </p>
            <p class="text-xs text-muted-foreground mt-1">
              Total Score
            </p>
          </CardContent>
        </Card>
        <Card class="text-center">
          <CardContent class="pt-4 pb-3">
            <p class="text-2xl font-bold text-foreground">
              {{ store.questions.length }}
            </p>
            <p class="text-xs text-muted-foreground mt-1">
              Total Questions
            </p>
          </CardContent>
        </Card>
        <Card class="text-center">
          <CardContent class="pt-4 pb-3">
            <p class="text-2xl font-bold text-green-600">
              {{ scoringResult.correct }}
            </p>
            <p class="text-xs text-muted-foreground mt-1">
              Correct
            </p>
          </CardContent>
        </Card>
        <Card class="text-center">
          <CardContent class="pt-4 pb-3">
            <p class="text-2xl font-bold text-red-600">
              {{ scoringResult.incorrect }}
            </p>
            <p class="text-xs text-muted-foreground mt-1">
              Incorrect
            </p>
          </CardContent>
        </Card>
        <Card class="text-center">
          <CardContent class="pt-4 pb-3">
            <p class="text-2xl font-bold text-gray-500">
              {{ scoringResult.unattempted }}
            </p>
            <p class="text-xs text-muted-foreground mt-1">
              Unattempted
            </p>
          </CardContent>
        </Card>
        <Card class="text-center">
          <CardContent class="pt-4 pb-3">
            <p class="text-2xl font-bold text-amber-600">
              {{ scoringResult.subjective }}
            </p>
            <p class="text-xs text-muted-foreground mt-1">
              Pending Grading
            </p>
          </CardContent>
        </Card>
      </div>

      <!-- Negative Marking Note -->
      <div
        v-if="store.config.enableNegativeMarking"
        class="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800"
      >
        ⚠️ Negative marking is enabled: -0.25 per incorrect answer.
      </div>

      <!-- Question-wise Review -->
      <h2 class="text-xl font-bold mb-4">
        Question-wise Review
      </h2>

      <div class="space-y-4">
        <Card
          v-for="review in questionReviews"
          :key="review.questionId"
          class="print-break-avoid"
        >
          <CardHeader class="pb-3">
            <CardTitle class="text-base flex items-start gap-2">
              <span class="inline-flex items-center justify-center h-6 min-w-[24px] px-1.5 rounded bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">
                Q{{ review.index + 1 }}
              </span>
              <!-- eslint-disable-next-line vue/no-v-html -->
              <span
                class="prose prose-sm max-w-none flex-1"
                v-html="renderSafe(review.questionText)"
              />
            </CardTitle>
          </CardHeader>
          <CardContent class="pt-0 space-y-3">
            <!-- Unattempted Badge -->
            <div
              v-if="review.isUnattempted"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-medium"
            >
              <MinusCircle class="h-3.5 w-3.5" />
              Unattempted
            </div>

            <!-- MCQ Options with State Highlighting -->
            <div
              v-if="Object.keys(review.options).length > 0"
              class="space-y-2"
            >
              <div
                v-for="[key, value] in Object.entries(review.options)"
                :key="key"
                class="flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-colors"
                :class="[
                  // User selected this AND it's correct → solid green
                  review.selectedOptionKey === key && key === review.correctAnswerKey
                    ? 'bg-green-50 border-green-400 text-green-900'
                    // User selected this AND it's wrong → solid red
                    : review.selectedOptionKey === key && key !== review.correctAnswerKey
                      ? 'bg-red-50 border-red-400 text-red-900'
                      // This is the correct answer but user picked something else or skipped → dashed green
                      : key === review.correctAnswerKey && (review.isUnattempted || (!review.isCorrect && !review.isSubjective && !review.isOther))
                        ? 'border-dashed border-green-500 bg-green-50/30'
                        // Default
                        : 'border-border bg-background'
                ]"
              >
                <!-- Icon per option -->
                <template v-if="review.selectedOptionKey === key && key === review.correctAnswerKey">
                  <CheckCircle class="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                </template>
                <template v-else-if="review.selectedOptionKey === key && key !== review.correctAnswerKey">
                  <XCircle class="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                </template>
                <template v-else-if="key === review.correctAnswerKey && (review.isUnattempted || (!review.isCorrect && !review.isSubjective && !review.isOther))">
                  <CheckCircle class="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                </template>
                <template v-else>
                  <span class="h-4 w-4 shrink-0 mt-0.5 rounded-full border border-muted-foreground/30 inline-block" />
                </template>
                <span class="flex-1">
                  <span class="font-semibold mr-1.5">{{ key }}.</span>
                  <!-- eslint-disable-next-line vue/no-v-html -->
                  <span v-html="renderSafe(value)" />
                </span>
              </div>
            </div>

            <!-- Subjective / "Other" text response in styled blockquote -->
            <div
              v-if="(review.isSubjective || review.isOther) && review.textResponse"
              class="mt-2"
            >
              <p class="text-xs font-medium text-muted-foreground mb-1.5">
                Your Response:
              </p>
              <blockquote class="border-l-4 border-amber-400 bg-amber-50/50 rounded-r-lg px-4 py-3 text-sm text-foreground italic">
                {{ review.textResponse }}
              </blockquote>
            </div>
            <div
              v-else-if="(review.isSubjective || review.isOther) && !review.textResponse"
              class="mt-2"
            >
              <p class="text-xs text-muted-foreground italic">
                No response provided.
              </p>
            </div>

            <!-- Quick-Grade UI for Subjective / OTHER -->
            <div
              v-if="review.isSubjective || review.isOther"
              class="no-print flex flex-wrap items-center gap-2 pt-3 border-t mt-3"
            >
              <span class="text-xs font-medium text-muted-foreground mr-1">Quick Grade:</span>
              <Button
                size="sm"
                variant="outline"
                class="h-7 text-xs gap-1"
                :class="manualScores[review.questionId] === (store.config.enableNegativeMarking ? -0.25 : 0) ? 'border-red-400 bg-red-50 text-red-700' : ''"
                @click="quickGrade(review.questionId, store.config.enableNegativeMarking ? -0.25 : 0)"
              >
                <XCircle class="h-3.5 w-3.5" />
                Incorrect
              </Button>
              <Button
                size="sm"
                variant="outline"
                class="h-7 text-xs gap-1"
                :class="manualScores[review.questionId] === 1 ? 'border-green-400 bg-green-50 text-green-700' : ''"
                @click="quickGrade(review.questionId, 1)"
              >
                <CheckCircle class="h-3.5 w-3.5" />
                Correct
              </Button>
              <div class="flex items-center gap-1.5">
                <Label
                  :for="`manual-${review.questionId}`"
                  class="text-xs text-muted-foreground whitespace-nowrap"
                >
                  Partial:
                </Label>
                <Input
                  :id="`manual-${review.questionId}`"
                  type="number"
                  step="0.25"
                  :min="store.config.enableNegativeMarking ? -0.25 : 0"
                  max="1"
                  class="w-20 h-7 text-xs"
                  :model-value="manualScores[review.questionId] ?? 0"
                  @update:model-value="(val: string | number) => updateManualScore(review.questionId, String(val))"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media print {
  .container {
    max-width: 100% !important;
    padding: 0 !important;
  }
}
</style>
