<script setup>
import { ref, computed, watchEffect, onMounted } from 'vue'
import html2canvas from 'html2canvas'
import { state } from './store'
import {
  fetchAllDashboardData,
  ApiError
} from './services/github'
import SearchBar from './components/SearchBar.vue'
import ProfileCard from './components/ProfileCard.vue'
import ContributionMap from './components/ContributionMap.vue'
import LanguageChart from './components/LanguageChart.vue'
import ActivityStream from './components/ActivityStream.vue'
import LoadingOverlay from './components/LoadingOverlay.vue'

const dashRef = ref(null)
const exporting = ref(false)

const isCyber = computed(() => state.theme === 'cyber')
const hasData = computed(() => !!state.data)

// 把主题写到 html 根节点
watchEffect(() => {
  document.documentElement.setAttribute('data-theme', state.theme)
})

// 首次加载示例用户，让看板开箱即用
onMounted(() => {
  if (!state.data && !state.loading) {
    load('octocat')
  }
})

const errorText = computed(() => {
  const code = state.error
  if (!code) return ''
  if (code === 'RATE_LIMITED')
    return 'API RATE LIMIT EXCEEDED — 请求频率超限，请稍后重试（浏览器端匿名请求有 60 次/小时限制）。'
  if (code === '404_NOT_FOUND')
    return 'USER NOT FOUND — 未找到该 GitHub 用户，请检查用户名拼写。'
  if (code === 'NETWORK')
    return 'NETWORK ERROR — 网络异常或跨域受限，请刷新重试。'
  return `ERROR: ${code}`
})

async function load(username) {
  state.username = username
  state.loading = true
  state.error = null
  try {
    state.data = await fetchAllDashboardData(username)
  } catch (err) {
    if (err instanceof ApiError) {
      state.error = err.message
    } else {
      state.error = err.message || 'UNKNOWN_ERROR'
    }
  } finally {
    state.loading = false
  }
}

function handleSubmit(username) {
  if (username && username !== state.username) {
    load(username)
  }
}

async function exportImage() {
  const el = dashRef.value
  if (!el) return
  exporting.value = true
  try {
    await nextTickSafe()
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: isCyber.value ? '#0a0a12' : '#141d2c',
      logging: false
    })
    const link = document.createElement('a')
    link.download = `github-dashboard-${(state.username || 'export')}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  } catch (e) {
    console.error('export failed', e)
    alert('导出失败：可能存在跨域图片，请稍后重试。')
  } finally {
    exporting.value = false
  }
}

function nextTickSafe() {
  return new Promise((r) => setTimeout(r, 50))
}
</script>

<template>
  <div class="theme-body relative">
    <div class="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <!-- 顶部交互区 -->
      <SearchBar @submit="handleSubmit" :query="state.username" />

      <!-- 错误提示 -->
      <div
        v-if="state.error"
        class="mt-6 panel p-4 border-l-4"
        :class="isCyber ? 'border-l-[#ff0055]' : 'border-l-[#ff4f9a]'"
      >
        <p class="text-sm glow-pink font-bold">⚠ {{ errorText }}</p>
        <p class="text-xs opacity-70 mt-1">
          TIP: 若为 Rate Limit，可在请求头中加入 `Authorization: Bearer {YOUR_TOKEN}` 以提升配额。
        </p>
      </div>

      <!-- 看板主体 -->
      <div ref="dashRef" class="mt-6">
        <!-- 空状态 -->
        <div v-if="!hasData && !state.loading && !state.error"
          class="panel p-10 text-center opacity-70">
          <div class="label mb-2">AWAITING_INPUT</div>
          <p class="text-sm">输入 GitHub 用户名以启动数据链接 ...</p>
        </div>

        <!-- 数据看板 -->
        <template v-else-if="hasData">
          <!-- 主网格 -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <!-- 左列：Profile -->
            <div class="lg:col-span-1">
              <ProfileCard
                :user="state.data.user"
                :stars="state.data.stars"
                :repo-count="state.data.repoCount"
              />
            </div>

            <!-- 右两列 -->
            <div class="lg:col-span-2 grid grid-cols-1 gap-5">
              <ContributionMap
                :days="state.data.contributions.days"
                :total="state.data.contributions.total"
              />
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <LanguageChart
                  :languages="state.data.languages"
                  :other="state.data.otherLanguages.reduce((s, l) => s + l.value, 0)"
                />
                <ActivityStream :activities="state.data.activities" />
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- 底部操作栏 -->
      <footer class="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pb-8">
        <p class="text-[10px] opacity-50 tracking-widest">
          POWERED_BY GITHUB_API · ECHARTS · HTML2CANVAS · VUE_3
        </p>
        <div class="flex gap-3">
          <button
            type="button"
            class="btn-cyber px-6 py-2.5 text-xs"
            :disabled="exporting || !hasData"
            @click="exportImage"
          >
            {{ exporting ? 'EXPORTING ...' : '⇩ EXPORT_POSTER' }}
          </button>
        </div>
      </footer>
    </div>

    <!-- 全屏加载层 -->
    <LoadingOverlay />
  </div>
</template>
