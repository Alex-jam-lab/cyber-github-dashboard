<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { state } from '../store'

const props = defineProps({
  activities: { type: Array, default: () => [] }
})

const displayed = ref([]) // 已"打印"出来的行
const typedText = ref('') // 当前正在打字的行
const busy = ref(false)

let timers = []
function clearTimers() {
  timers.forEach((t) => clearTimeout(t))
  timers = []
}

// 终端标题
const title = computed(() =>
  state.theme === 'cyber'
    ? 'root@cyber:~$ git log --oneline -5'
    : 'C:\\GITHUB> dir activity.log'
)

async function runTypewriter() {
  clearTimers()
  displayed.value = []
  typedText.value = ''
  busy.value = true

  const lines = props.activities || []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    typedText.value = ''
    // 逐字符打字
    for (let c = 0; c < line.line.length; c++) {
      typedText.value = line.line.slice(0, c + 1)
      await delay(12 + Math.random() * 18)
    }
    // 固定为完整行，推入历史
    typedText.value = ''
    displayed.value.push(line)
    await delay(160)
  }
  busy.value = false
}

function delay(ms) {
  return new Promise((res) => {
    const t = setTimeout(res, ms)
    timers.push(t)
  })
}

function kindColor(kind) {
  if (state.theme === 'cyber') {
    const map = {
      commit: '#00f3ff',
      create: '#ffe600',
      pr: '#00ffa3',
      issue: '#ff7a00',
      star: '#ffe600',
      fork: '#9d00ff',
      release: '#ff0055'
    }
    return map[kind] || '#7f9fae'
  }
  return '#ffd23f'
}

onMounted(() => runTypewriter())
onBeforeUnmount(clearTimers)

watch(
  () => props.activities,
  async () => {
    await runTypewriter()
  }
)
</script>

<template>
  <section class="panel p-0 overflow-hidden h-full">
    <!-- 终端顶栏 -->
    <div class="terminal">
      <div class="flex items-center justify-between px-4 py-2.5 border-b"
        :class="state.theme === 'cyber' ? 'border-[rgba(0,243,255,0.25)]' : 'border-[#7c5cff]'">
        <span class="text-xs opacity-70 truncate">{{ title }}</span>
        <span class="flex gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></span>
          <span class="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></span>
          <span class="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></span>
        </span>
      </div>

      <div class="px-4 py-3 font-mono text-xs space-y-1.5 min-h-[150px] max-h-[230px] overflow-y-auto">
        <template v-if="busy || displayed.length || typedText">
          <div
            v-for="(row, i) in displayed"
            :key="i"
            class="flex items-start gap-2"
          >
            <span class="shrink-0 select-none" :style="{ color: kindColor(row.kind) }">
              <template v-if="row.kind === 'commit'">λ</template>
              <template v-else-if="row.kind === 'star'">★</template>
              <template v-else-if="row.kind === 'fork'">⑂</template>
              <template v-else>›</template>
            </span>
            <span class="flex-1 break-all">
              <span :style="{ color: kindColor(row.kind) }">[{{ row.kind.toUpperCase() }}]</span>
              <span class="opacity-90"> {{ row.line }}</span>
              <span class="opacity-50 ml-1.5">({{ row.ago }})</span>
            </span>
          </div>

          <!-- 正在打字的一行 -->
          <div v-if="typedText" class="flex items-start gap-2">
            <span class="shrink-0 text-[var(--accent)]">λ</span>
            <span class="flex-1 break-all">{{ typedText }}<span class="cursor-block"></span></span>
          </div>
          <div v-else-if="!busy" class="flex items-center gap-2">
            <span class="text-[var(--accent)]">λ</span>
            <span class="cursor-block"></span>
          </div>
        </template>
        <div v-else class="opacity-50">// no public activity found</div>
      </div>
    </div>
  </section>
</template>
