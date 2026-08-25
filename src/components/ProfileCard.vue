<script setup>
import { computed } from 'vue'
import { state } from '../store'
import { Icon } from '@iconify/vue'

const props = defineProps({
  user: { type: Object, required: true },
  stars: { type: Number, default: 0 },
  repoCount: { type: Number, default: 0 }
})

const isCyber = computed(() => state.theme === 'cyber')

const fmt = (n) =>
  n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : String(n)
</script>

<template>
  <section class="panel p-5 h-full">
    <div class="card-title">
      <span class="label">PROFILE // IDENTITY</span>
    </div>

    <div class="flex flex-col sm:flex-row gap-5 items-start">
      <!-- Avatar -->
      <div class="relative shrink-0">
        <img
          :src="user.avatar_url"
          :alt="user.login"
          class="avatar-glow w-24 h-24 object-cover"
          :class="isCyber ? 'rounded-lg' : ''"
        />
        <span
          v-if="user.hireable"
          class="absolute -top-2 -right-2 text-[10px] px-2 py-0.5 chip"
        >
          OPEN_TO_WORK
        </span>
      </div>

      <!-- Identity -->
      <div class="min-w-0 flex-1">
        <h2 class="value text-xl md:text-2xl truncate font-bold">{{ user.name || user.login }}</h2>
        <p class="text-sm opacity-70 truncate">
          <span class="glow-pink">@{{ user.login }}</span>
          <span v-if="user.company" class="ml-2">◈ {{ user.company }}</span>
        </p>
        <p v-if="user.bio" class="mt-2 text-sm opacity-80 leading-relaxed line-clamp-2">
          {{ user.bio }}
        </p>
        <p v-else class="mt-2 text-sm opacity-40">// no bio provided</p>

        <!-- Stats row -->
        <div class="mt-4 grid grid-cols-4 gap-2">
          <div class="chip px-2 py-2 text-center">
            <div class="value text-lg leading-none" :title="String(user.followers)">
              {{ fmt(user.followers) }}
            </div>
            <div class="text-[10px] opacity-70 mt-1">FOLLOWERS</div>
          </div>
          <div class="chip px-2 py-2 text-center">
            <div class="value text-lg leading-none" :title="String(user.following)">
              {{ fmt(user.following) }}
            </div>
            <div class="text-[10px] opacity-70 mt-1">FOLLOWING</div>
          </div>
          <div class="chip px-2 py-2 text-center">
            <div class="value text-lg leading-none glow-yellow" :title="String(stars)">
              ★ {{ fmt(stars) }}
            </div>
            <div class="text-[10px] opacity-70 mt-1">STARS</div>
          </div>
          <div class="chip px-2 py-2 text-center">
            <div class="value text-lg leading-none" :title="String(repoCount)">
              {{ fmt(repoCount) }}
            </div>
            <div class="text-[10px] opacity-70 mt-1">REPOS</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Links row -->
    <div class="mt-4 pt-3 border-t" :class="isCyber ? 'border-[var(--border)]' : 'border-[var(--border)]'">
      <div class="flex flex-wrap gap-3 text-xs opacity-80">
        <a
          :href="user.html_url"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-1 hover:opacity-100 transition-opacity"
        >
          <Icon icon="mdi:github" /> github
        </a>
        <a
          v-if="user.blog"
          :href="user.blog.startsWith('http') ? user.blog : 'https://' + user.blog"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-1 hover:opacity-100 transition-opacity"
        >
          <Icon icon="mdi:link-variant" /> blog
        </a>
        <a
          v-if="user.location"
          class="inline-flex items-center gap-1"
        >
          <Icon icon="mdi:map-marker" /> {{ user.location }}
        </a>
        <span v-if="user.created_at" class="inline-flex items-center gap-1">
          <Icon icon="mdi:calendar" /> SINCE {{ new Date(user.created_at).getFullYear() }}
        </span>
      </div>
    </div>
  </section>
</template>
