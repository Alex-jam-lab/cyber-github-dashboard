<script setup>
import { state } from '../store'
</script>

<template>
  <Teleport to="body">
    <div
      v-if="state.loading"
      class="scanlines fixed inset-0 z-50 flex items-center justify-center"
      style="background: rgba(4, 6, 12, 0.82)"
    >
      <div class="text-center">
        <div class="cyber-spinner mx-auto"></div>
        <p class="label mt-5 text-sm tracking-[0.3em]">
          <span v-if="state.theme === 'cyber'">[ INITIALIZING NEURAL LINK ... ]</span>
          <span v-else>LOADING . . .</span>
        </p>
        <p class="text-xs mt-2 opacity-50">{{ state.username || 'fetching user data' }}</p>
      </div>
    </div>
  </Teleport>
</template>
