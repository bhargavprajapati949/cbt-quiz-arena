<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTestSessionStore } from '@/stores/testSession'
import { useCbtEngine } from '@/composables/useCbtEngine'
import { useRemoteQuiz } from '@/composables/useRemoteQuiz'
import type { QuizConfig } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Upload, Play, Trash2, AlertTriangle, Clock, Copy, Check, Loader2, Link, X } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const store = useTestSessionStore()
const { initializeTest, discardTest } = useCbtEngine()
const { isLoading: isRemoteLoading, fetchError: remoteFetchError, loadFromUrl } = useRemoteQuiz()

const quizData = ref<QuizConfig | null>(null)
const duration = ref<number>(60)
const enableNegativeMarking = ref<boolean>(false)
const fileName = ref<string>('')
const fileError = ref<string>('')
const isDragging = ref<boolean>(false)
const showResumeDialog = ref<boolean>(false)
const promptCopied = ref<boolean>(false)
const remoteLoadUrl = ref<string>('')

const hasActiveSession = computed(() => store.isActive && !store.isCompleted)

const resumeTimeFormatted = computed(() => {
  const total = store.timeRemainingSec
  const min = Math.floor(total / 60)
  const sec = total % 60
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
})

onMounted(async () => {
  // Production-ready flow:
  // If the user has an active session, show the dialog IMMEDIATELY.
  // Do not block the UI waiting for a remote fetch, and do not waste bandwidth 
  // if they intend to resume the old test.
  if (hasActiveSession.value) {
    showResumeDialog.value = true
    return
  }

  // If no active session, proceed to check for remote URL
  await checkAndLoadRemoteQuiz()
})

const checkAndLoadRemoteQuiz = async () => {
  // Check for ?test= query parameter
  // In hash mode, vue-router expects the query after the hash (e.g. /#/?test=...)
  // But users often put it before the hash (e.g. /?test=...#/). We check both.
  let testUrl = route.query.test as string | undefined
  if (!testUrl) {
    const searchParams = new URLSearchParams(window.location.search)
    testUrl = searchParams.get('test') || undefined
  }

  if (typeof testUrl === 'string' && testUrl.trim() !== '') {
    remoteLoadUrl.value = testUrl
    const config = await loadFromUrl(testUrl)
    if (config) {
      quizData.value = config
      try {
        const urlParts = new URL(testUrl).pathname.split('/')
        fileName.value = urlParts[urlParts.length - 1] || 'Remote Quiz'
      } catch {
        fileName.value = 'Remote Quiz'
      }
      if (config.duration) {
        duration.value = config.duration
      }
    }
  }
}

const aiPrompt = `Generate a JSON quiz file in the following format. The JSON should have a "duration" field (test duration in minutes) and a "questions" array. Each question object should have:
- "id": a unique number
- "question": the question text (supports Markdown and LaTeX math with $..$ for inline and $$...$$ for display)
- "options": an object with keys like "A", "B", "C", "D" and their text values. Use an empty object {} for subjective questions.
- "answer": the correct option key (e.g., "B"), or an empty string "" for subjective questions.

Example:
{
  "duration": 60,
  "questions": [
    {
      "id": 1,
      "question": "What is $2+2$?",
      "options": { "A": "3", "B": "4", "C": "5", "D": "6" },
      "answer": "B"
    }
  ]
}`

const processFile = (file: File) => {
  fileError.value = ''
  if (!file.name.endsWith('.json')) {
    fileError.value = 'Please upload a valid .json file.'
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target?.result as string) as QuizConfig
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        fileError.value = 'Invalid JSON format: "questions" array is missing.'
        return
      }
      quizData.value = parsed
      fileName.value = file.name
      if (parsed.duration) {
        duration.value = parsed.duration
      }
      // Clear remote state if manual upload occurs
      remoteLoadUrl.value = ''
      remoteFetchError.value = ''
    } catch {
      fileError.value = 'Failed to parse JSON file. Please check the format.'
    }
  }
  reader.readAsText(file)
}

const handleFileInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files?.[0]) {
    processFile(input.files[0])
  }
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const file = event.dataTransfer?.files[0]
  if (file) {
    processFile(file)
  }
}

const startTest = () => {
  if (!quizData.value) return
  quizData.value.duration = duration.value
  initializeTest(quizData.value, enableNegativeMarking.value)
  router.push('/test')
}

const resumeTest = () => {
  showResumeDialog.value = false
  router.push('/test')
}

const discardAndRestart = async () => {
  discardTest()
  showResumeDialog.value = false
  // Now that the old test is cleared, fetch the remote one if pending in URL
  await checkAndLoadRemoteQuiz()
}

const clearRemoteQuiz = () => {
  remoteLoadUrl.value = ''
  quizData.value = null
  fileName.value = ''
}

const dismissRemoteError = () => {
  remoteFetchError.value = ''
  remoteLoadUrl.value = ''
}

const copyPrompt = async () => {
  await navigator.clipboard.writeText(aiPrompt)
  promptCopied.value = true
  setTimeout(() => { promptCopied.value = false }, 2000)
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    <div class="container max-w-3xl mx-auto py-8 px-4">
      <!-- Title -->
      <div class="text-center mb-8">
        <h1 class="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
          CBT Quiz Arena
        </h1>
        <p class="mt-2 text-muted-foreground">
          Upload a JSON quiz file to begin your Computer Based Test simulation.
        </p>
      </div>

      <!-- Remote Loading State -->
      <Card
        v-if="isRemoteLoading"
        class="mb-6"
      >
        <CardContent class="pt-6 pb-6">
          <div class="flex flex-col items-center justify-center gap-3 py-4 text-center">
            <Loader2 class="h-8 w-8 text-primary animate-spin" />
            <p class="text-sm font-medium text-foreground">
              Loading quiz from URL…
            </p>
            <p class="text-xs text-muted-foreground max-w-sm break-all">
              {{ remoteLoadUrl }}
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- Remote Fetch Error -->
      <div
        v-if="remoteFetchError && !isRemoteLoading"
        class="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive"
      >
        <div class="flex items-start gap-3">
          <AlertTriangle class="h-5 w-5 shrink-0 mt-0.5" />
          <div class="flex-1">
            <h5 class="text-sm font-semibold mb-1 leading-none tracking-tight">
              Failed to Load Remote Quiz
            </h5>
            <p class="text-sm text-destructive/90">
              {{ remoteFetchError }}
            </p>
          </div>
          <button
            class="text-destructive/70 hover:text-destructive transition-colors"
            @click="dismissRemoteError"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
      </div>

      <!-- File Upload Card (shown unless actively loading from remote) -->
      <Card
        v-if="!isRemoteLoading"
        class="mb-6"
      >
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Upload class="h-5 w-5" />
            Import Quiz
          </CardTitle>
          <CardDescription>
            Drag and drop your JSON quiz file or click to browse.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <!-- Remote source badge -->
          <div
            v-if="remoteLoadUrl && quizData && !remoteFetchError"
            class="mb-4 flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
          >
            <Link class="h-4 w-4 shrink-0 text-primary" />
            <span
              class="flex-1 break-all line-clamp-1"
              :title="remoteLoadUrl"
            >
              Loaded from: <strong class="text-foreground">{{ remoteLoadUrl }}</strong>
            </span>
            <Button
              variant="ghost"
              size="icon"
              class="h-6 w-6 rounded-full hover:bg-muted"
              @click="clearRemoteQuiz"
            >
              <X class="h-3.5 w-3.5" />
            </Button>
          </div>

          <div
            class="relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer"
            :class="isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'"
            @dragover.prevent="isDragging = true"
            @dragleave="isDragging = false"
            @drop.prevent="handleDrop"
            @click="($refs.fileInput as HTMLInputElement)?.click()"
          >
            <input
              ref="fileInput"
              type="file"
              accept=".json"
              class="hidden"
              @change="handleFileInput"
            >
            <Upload class="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p class="text-sm text-muted-foreground">
              <span class="font-semibold text-foreground">Click to upload</span>
              or drag and drop
            </p>
            <p class="text-xs text-muted-foreground mt-1">
              JSON files only
            </p>
          </div>

          <p
            v-if="fileError"
            class="mt-3 text-sm text-red-600 flex items-center gap-1.5"
          >
            <AlertTriangle class="h-4 w-4" />
            {{ fileError }}
          </p>

          <div
            v-if="quizData"
            class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg"
          >
            <p class="text-sm text-green-800 font-medium">
              ✓ Loaded "{{ fileName }}" — {{ quizData.questions.length }} questions
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- Configuration Card -->
      <Card
        class="mb-6"
        :class="!quizData ? 'opacity-50 pointer-events-none' : ''"
      >
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <Label
                for="duration"
                class="mb-2 block"
              >Duration (minutes)</Label>
              <Input
                id="duration"
                v-model.number="duration"
                type="number"
                min="1"
                max="300"
                placeholder="60"
              />
            </div>
            <div class="flex items-end">
              <label class="flex items-center gap-2 cursor-pointer select-none">
                <input
                  v-model="enableNegativeMarking"
                  type="checkbox"
                  class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                >
                <span class="text-sm">Enable Negative Marking (-0.25)</span>
              </label>
            </div>
          </div>

          <Button
            class="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 mt-4"
            :disabled="!quizData"
            @click="startTest"
          >
            <Play class="h-4 w-4" />
            Start Test
          </Button>
        </CardContent>
      </Card>

      <!-- AI Prompt Card -->
      <Card>
        <CardHeader>
          <CardTitle>AI Prompt Generator</CardTitle>
          <CardDescription>
            Copy this prompt and use it with ChatGPT, Gemini, or any LLM to generate a compatible quiz JSON.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="relative">
            <pre class="text-xs bg-muted p-4 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed">{{ aiPrompt }}</pre>
            <Button
              variant="outline"
              size="sm"
              class="absolute top-2 right-2 gap-1.5"
              @click="copyPrompt"
            >
              <Check
                v-if="promptCopied"
                class="h-3.5 w-3.5 text-green-600"
              />
              <Copy
                v-else
                class="h-3.5 w-3.5"
              />
              {{ promptCopied ? 'Copied!' : 'Copy' }}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Resume Session Dialog -->
    <Dialog
      :open="showResumeDialog"
      @update:open="(val: boolean) => { if (!val) showResumeDialog = false }"
    >
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <AlertTriangle class="h-5 w-5 text-amber-500" />
            In-Progress Session Detected
          </DialogTitle>
          <DialogDescription>
            You have an unfinished test session.
          </DialogDescription>
        </DialogHeader>
        <div class="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
          <Clock class="h-4 w-4 text-amber-600" />
          <span class="text-amber-800">Time remaining: <strong>{{ resumeTimeFormatted }}</strong></span>
        </div>
        <DialogFooter class="gap-2 sm:gap-0">
          <Button
            variant="outline"
            class="gap-1.5"
            @click="discardAndRestart"
          >
            <Trash2 class="h-4 w-4" />
            Discard &amp; Start New
          </Button>
          <Button
            class="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
            @click="resumeTest"
          >
            <Play class="h-4 w-4" />
            Resume Test
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
