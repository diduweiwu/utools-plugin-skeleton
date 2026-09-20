<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useMessage } from 'naive-ui'

import { useAppStore } from '@/stores/app'
import type { ThemeMode } from '@/stores/app'

const message = useMessage()
const appStore = useAppStore()
const { themeMode } = storeToRefs(appStore)

function onThemeModeChange(value: string | number | boolean) {
  appStore.setThemeMode(value as ThemeMode)
  message.success('已保存（持久化到 uTools db，重启插件后仍生效）')
}
</script>

<template>
  <n-card title="设置" size="small" style="max-width: 640px">
    <n-form label-placement="left" label-width="100">
      <n-form-item label="主题模式">
        <n-radio-group :value="themeMode" @update:value="onThemeModeChange">
          <n-radio-button value="auto">跟随系统</n-radio-button>
          <n-radio-button value="light">浅色</n-radio-button>
          <n-radio-button value="dark">深色</n-radio-button>
        </n-radio-group>
      </n-form-item>
      <n-form-item label="持久化说明">
        <n-text depth="3">
          设置项经 src/services/utools.ts 的 dbPut / dbGet 写入 uTools 本地数据库，
          修改 src/stores/app.ts 即可扩展自己的设置项。
        </n-text>
      </n-form-item>
    </n-form>
  </n-card>
</template>
