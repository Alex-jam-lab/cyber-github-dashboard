<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { state } from '../store'

const props = defineProps({
  languages: { type: Array, default: () => [] }, // [{name, value}]
  other: { type: Number, default: 0 }
})

const chartEl = ref(null)
let chart = null

const PALETTE = ['#00f3ff', '#ff0055', '#ffe600', '#9d00ff', '#00ffa3', '#ff7a00']

function buildOption() {
  const data = (props.languages || []).map((l, i) => ({
    name: l.name,
    value: l.value,
    itemStyle: {
      color: PALETTE[i % PALETTE.length]
    }
  }))

  const isCyber = state.theme === 'cyber'
  const textColor = isCyber ? '#d7f6ff' : '#f4f1ff'
  const dimColor = isCyber ? '#7f9fae' : '#9a93c4'

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: (p) => `${p.name}: ${p.value}%`,
      backgroundColor: isCyber ? '#0a0a12' : '#0a0f1d',
      borderColor: isCyber ? '#00f3ff' : '#7c5cff',
      textStyle: { color: textColor, fontFamily: 'monospace' }
    },
    title: {
      text: '',
      subtext: 'LANG_DISTRIBUTION',
      left: 'center',
      top: '3%',
      subtextStyle: {
        color: isCyber ? '#00f3ff' : '#ffd23f',
        fontFamily: 'monospace',
        fontSize: 11,
        letterSpacing: 2
      }
    },
    series: [
      {
        type: 'pie',
        radius: ['52%', '72%'],
        center: ['50%', '55%'],
        avoidLabelOverlap: true,
        padAngle: 3,
        itemStyle: {
          borderRadius: isCyber ? 8 : 2,
          borderColor: isCyber ? '#0a0a12' : '#0a0f1d',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}\n{d}%',
          color: textColor,
          fontFamily: 'monospace',
          fontSize: 10
        },
        emphasis: {
          label: {
            show: true,
            fontWeight: 'bold',
            fontSize: 13
          }
        },
        data
      }
    ]
  }
}

function render() {
  if (!chartEl.value) return
  if (!chart) chart = echarts.init(chartEl.value)
  chart.setOption(buildOption(), true)
}

function resize() {
  chart && chart.resize()
}

onMounted(async () => {
  await nextTick()
  render()
  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  chart && chart.dispose()
  chart = null
})

watch([() => props.languages, () => state.theme], async () => {
  await nextTick()
  render()
})
</script>

<template>
  <section class="panel p-5">
    <div class="card-title">
      <span class="label">LANGUAGES // STACK_SCAN</span>
    </div>

    <div ref="chartEl" class="w-full h-[280px]"></div>

    <!-- legend -->
    <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] opacity-85">
      <span v-for="l in languages" :key="l.name" class="inline-flex items-center gap-1.5">
        <span class="lang-dot" :style="{ background: PALETTE[languages.indexOf(l) % PALETTE.length] }"></span>
        {{ l.name }} · {{ l.value }}%
      </span>
      <span v-if="other > 0" class="inline-flex items-center gap-1.5 opacity-60">
        <span class="lang-dot" :style="{ background: PALETTE[(languages.length) % PALETTE.length] }"></span>
        OTHER · {{ other }}%
      </span>
    </div>
  </section>
</template>
