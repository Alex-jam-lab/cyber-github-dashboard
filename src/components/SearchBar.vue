<script setup>
import { ref, computed } from 'vue'
import { state } from '../store'

const input = ref('')
const props = defineProps({ query: { type: String, default: '' } })
const emit = defineEmits(['submit'])

const canSearch = computed(() => input.value.trim().length > 0)

function submit() {
  if (canSearch.value) emit('submit', input.value.trim())
}

function onKey(e) {
  if (e.key === 'Enter') submit()
}
</script>

<template>
  <header class="w-full">
    <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
      <!-- Logo -->
      <div class="flex-1">
        <div class="flex items-center gap-3">
          <span class="panel w-11 h-11 grid place-items-center text-xl" aria-hidden="true">
            <span class="glow-pink">▚</span>
          </span>
          <div>
            <h1 class="label text-xl md:text-2xl leading-none">GITHUB://CYBER_DASHBOARD</h1>
            <p class="text-xs mt-1 opacity-70 tracking-widest">STATUS: ONLINE — LIVE DATA LINK</p>
          </div>
        </div>
      </div>

      <!-- Style Switcher -->
      <div class="style-switch" role="tablist" aria-label="主题切换">
        <button
          type="button"
          role="tab"
          :aria-selected="state.theme === 'cyber'"
          :class="state.theme === 'cyber' ? 'active' : ''"
          @click="state.theme = 'cyber'"
        >
          <span class="hidden sm:inline">Cyberpunk </span>NEON
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="state.theme === 'pixel'"
          :class="state.theme === 'pixel' ? 'active' : ''"
          @click="state.theme = 'pixel'"
        >
          <span class="hidden sm:inline">Retro </span>PIXEL
        </button>
      </div>
    </div>

    <!-- Search row -->
    <div class="mt-6 flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <input
          v-model="input"
          type="text"
          placeholder="ENTER_GITHUB_USERNAME ..."
          class="search-input pr-10"
          spellcheck="false"
          autocomplete="off"
          aria-label="GitHub 用户名"
          @keydown="onKey"
        />
        <span
          v-if="!input"
          class="cursor-block absolute right-4 top-1/2 -translate-y-1/2"
          aria-hidden="true"
        ></span>
      </div>
      <button
        type="button"
        class="btn-cyber px-6 py-3 text-sm"
        :disabled="!canSearch"
        @click="submit"
      >
        ▶ LOAD_DATA
      </button>
    </div>
  </header>
</template>
