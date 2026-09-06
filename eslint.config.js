import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

export default [
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['*.vue', '**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser
      }
    }
  },
  {
    // Shadcn-vue generated components are single-word by design
    files: ['src/components/ui/**/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/require-default-prop': 'off',
    }
  },
  {
    // v-html is safe when DOMPurify is used to sanitize
    files: ['**/*.vue'],
    rules: {
      'vue/no-v-html': 'warn',
    }
  }
]
