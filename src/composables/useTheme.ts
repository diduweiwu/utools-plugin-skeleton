import { computed } from 'vue'
import { darkTheme, useOsTheme } from 'naive-ui'
import type { GlobalTheme } from 'naive-ui'
import { storeToRefs } from 'pinia'

import { useAppStore } from '@/stores/app'

/**
 * 根据用户设置（auto / light / dark）与系统主题，
 * 计算出 naive-ui 需要的主题对象
 */
export function useTheme() {
  const appStore = useAppStore()
  const { themeMode } = storeToRefs(appStore)
  const osTheme = useOsTheme()

  const theme = computed<GlobalTheme | null>(() => {
    if (themeMode.value === 'dark') return darkTheme
    if (themeMode.value === 'light') return null
    return osTheme.value === 'dark' ? darkTheme : null
  })

  return { theme, themeMode }
}
