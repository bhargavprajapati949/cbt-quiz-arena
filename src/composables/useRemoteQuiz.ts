import { ref } from 'vue'
import type { QuizConfig } from '@/types'

export function useRemoteQuiz() {
  const isLoading = ref<boolean>(false)
  const fetchError = ref<string>('')

  const loadFromUrl = async (url: string): Promise<QuizConfig | null> => {
    isLoading.value = true
    fetchError.value = ''

    // Validate URL format — must be absolute http(s) URL
    if (!url || !/^https?:\/\//i.test(url)) {
      fetchError.value =
        'Invalid URL. Please provide a fully-qualified URL starting with https:// or http://.'
      isLoading.value = false
      return null
    }

    let response: Response
    try {
      response = await fetch(url)
    } catch {
      fetchError.value =
        'Network error: Unable to reach the URL. This may be caused by CORS restrictions, a firewall, or an invalid address. Please check the URL and try again.'
      isLoading.value = false
      return null
    }

    if (!response.ok) {
      fetchError.value = `Failed to load quiz: Server responded with HTTP ${response.status} (${response.statusText}). Please verify the URL is publicly accessible.`
      isLoading.value = false
      return null
    }

    let data: unknown
    try {
      data = await response.json()
    } catch {
      fetchError.value =
        'The URL did not return valid JSON. Please make sure the URL points to a properly formatted quiz JSON file.'
      isLoading.value = false
      return null
    }

    // Schema validation
    if (
      typeof data !== 'object' ||
      data === null ||
      !('questions' in data) ||
      !Array.isArray((data as Record<string, unknown>).questions)
    ) {
      fetchError.value =
        'Invalid quiz format: The JSON file is missing a "questions" array. Please check the file format matches the required schema.'
      isLoading.value = false
      return null
    }

    const config = data as QuizConfig
    if (config.questions.length === 0) {
      fetchError.value = 'The quiz file contains no questions. Please provide a non-empty quiz.'
      isLoading.value = false
      return null
    }

    isLoading.value = false
    return config
  }

  return { isLoading, fetchError, loadFromUrl }
}
