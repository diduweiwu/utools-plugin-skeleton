import { defineStore } from 'pinia'
import { ref } from 'vue'

import { dbGet, dbPut } from '@/services/utools'
import type { PluginEnterAction } from '@/services/utools'

export type ThemeMode = 'auto' | 'light' | 'dark'

/** 本地持久化的设置项（存放在 uTools db） */
interface PersistedSettings {
  themeMode: ThemeMode
}

const SETTINGS_KEY = 'skeleton.settings'

/** 全局应用状态：设置项 + 插件运行时信息 */
export const useAppStore = defineStore('app', () => {
  /** 主题模式，auto 表示跟随系统 */
  const themeMode = ref<ThemeMode>('auto')
  /** 最近一次插件进入时的动作信息 */
  const enterAction = ref<PluginEnterAction | null>(null)

  function setThemeMode(mode: ThemeMode) {
    themeMode.value = mode
    persistSettings()
  }

  function setEnterAction(action: PluginEnterAction) {
    enterAction.value = action
  }

  function persistSettings() {
    const settings: PersistedSettings = { themeMode: themeMode.value }
    dbPut(SETTINGS_KEY, settings)
  }

  /** 应用启动时恢复持久化数据，在 main.ts 中调用 */
  function init() {
    const settings = dbGet<PersistedSettings>(SETTINGS_KEY)
    if (settings?.themeMode) {
      themeMode.value = settings.themeMode
    }
  }

  return { themeMode, enterAction, setThemeMode, setEnterAction, init }
})
