<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { state } from '../store'

const props = defineProps({
  days: { type: Array, default: () => [] },
  total: { type: Number, default: 0 }
})

const canvasEl = ref(null)

const isCyber = computed(() => state.theme === 'cyber')

// 近一年贡献天数（可能有空数据，最多 371 天）
const data = computed(() => {
  const arr = props.days || []
  return arr.slice(-371).map((d) => Math.min(d.count || 0, 4))
})

function draw() {
  const canvas = canvasEl.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  const theme = state.theme
  const cols = 53
  const cell = theme === 'pixel' ? 12 : 14
  const gap = theme === 'pixel' ? 3 : 4
  const rows = Math.ceil(data.value.length / cols)
  const height = rows * (cell + gap) + gap
  const width = cols * (cell + gap) + gap

  const dpr = window.devicePixelRatio || 1
  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = width + 'px'
  canvas.style.height = height + 'px'
  ctx.scale(dpr, dpr)

  // 清空背景
  ctx.clearRect(0, 0, width, height)
  if (theme === 'pixel') {
    ctx.fillStyle = '#0b101f'
    ctx.fillRect(0, 0, width, height)
  }

  // 贡献度 → 颜色
  const levels = [0, 1, 2, 3, 4]
  const colorFor = (lv) => {
    if (theme === 'pixel') {
      const map = {
        0: '#1c2333',
        1: '#8fbf3f',
        2: '#c2e84f',
        3: '#f4e04d',
        4: '#ff9d3c'
      }
      return map[lv] || map[0]
    }
    const map = {
      0: '#111a2e',
      1: '#0b6d7d',
      2: '#00b3c7',
      3: '#00f3ff',
      4: '#ff0055'
    }
    return map[lv] || map[0]
  }

  data.value.forEach((lv, i) => {
    const col = Math.floor(i / rows)
    const row = i % rows
    const x = gap + col * (cell + gap)
    const y = gap + row * (cell + gap)
    const color = colorFor(lv)

    if (theme === 'pixel') {
      // 8-bit：带阴影的小像素块
      ctx.fillStyle = '#05070f'
      ctx.fillRect(x + 2, y + 2, cell, cell)
      ctx.fillStyle = color
      ctx.fillRect(x, y, cell, cell)
      ctx.fillStyle = 'rgba(255,255,255,0.28)'
      ctx.fillRect(x + 2, y + 2, cell - 4, 2)
    } else {
      // cyber：发光圆点
      ctx.shadowColor = color
      ctx.shadowBlur = lv >= 3 ? 14 : lv > 0 ? 8 : 0
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(x + cell / 2, y + cell / 2, cell / 2 - 1, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
    }
  })
}

onMounted(async () => {
  await nextTick()
  draw()
})

watch([() => props.days, () => state.theme], async () => {
  await nextTick()
  draw()
})
</script>

<template>
  <section class="panel p-5">
    <div class="card-title flex items-center justify-between">
      <span class="label">CONTRIBUTIONS // COMMIT_GRID</span>
      <span class="glow-yellow text-sm font-mono">{{ total }} COMMITS</span>
    </div>

    <div class="overflow-x-auto">
      <canvas ref="canvasEl" class="mx-auto"></canvas>
    </div>

    <div class="mt-4 flex items-center justify-end gap-2 text-[10px] opacity-70">
      <span>LESS</span>
      <span
        v-for="(c, i) in (isCyber ? ['#111a2e','#0b6d7d','#00b3c7','#00f3ff','#ff0055'] : ['#1c2333','#8fbf3f','#c2e84f','#f4e04d','#ff9d3c'])"
        :key="i"
        class="w-3 h-3 inline-block"
        :style="{ background: c }"
      ></span>
      <span>MORE</span>
    </div>
  </section>
</template>
