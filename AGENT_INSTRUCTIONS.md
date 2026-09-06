# AI Agent System Instructions

You are an expert AI coding assistant. You are helping develop a 100% client-side CBT (Computer Based Test) Simulator. 
Before writing or modifying any code, you must ingest and strictly adhere to the project documentation located in the `docs/` directory.

## 1. Project Context & Requirements
Always refer to `docs/cbt_simulator_prd.md` for feature requirements, user flows, and core functionality. Do not invent features or backend integrations outside this stateless scope.

## 2. Technical Architecture
Always refer to `docs/cbt_simulator_tech_spec.md` for the directory structure, Pinia state models, TypeScript interfaces, and component hierarchy. Use this as your structural blueprint.

## 3. Coding Standards (Strictly Enforced)
Always refer to `docs/vue3_cbt_coding_standards.md` for Vue 3 best practices tailored to this project.
* Use Vue 3 Composition API with `<script setup lang="ts">` exclusively.
* Never use the Options API.
* Ensure all active test state is synced to localStorage via `pinia-plugin-persistedstate`.
* Sanitize all Markdown and KaTeX outputs using DOMPurify before rendering with `v-html`.

## 4. Execution Guidelines
* **Read Before Writing:** If asked to implement a feature, read the relevant sections in the `docs/` files first to ensure compliance with the architecture.
* **No Placeholders:** Provide complete, working code blocks. Do not use comments like `// implement logic here` or `// ...rest of code`.
* **Think Step-by-Step:** Briefly outline your approach before outputting large refactors or new components.
* **Dependency Management:** Do not introduce new npm packages without explicit permission. Stick to the core stack (Vue, Vite, Tailwind, Shadcn-vue, Pinia, Vue Router, markdown-it, katex, dompurify).
* **Verification:** Each time you make any changes to code, you must run `npm run type-check` and `npm run lint` and verify if everything is good before reporting back to the user.