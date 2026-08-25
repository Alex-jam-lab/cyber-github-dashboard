import { reactive, computed } from 'vue'

/**
 * 全局共享状态：主题 + 用户数据
 */
export const state = reactive({
  theme: 'cyber', // 'cyber' | 'pixel'
  username: '',
  loading: false,
  error: null,
  data: null
})

export const isCyber = computed(() => state.theme === 'cyber')
