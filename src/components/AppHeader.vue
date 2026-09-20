<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

import { useAppStore } from '@/stores/app'
import type { ThemeMode } from '@/stores/app'

const NAV_ITEMS = [
  { label: '首页', to: '/' },
  { label: '设置', to: '/settings' },
] as const

const THEME_OPTIONS: Array<{ label: string; value: ThemeMode }> = [
  { label: '自动', value: 'auto' },
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' },
]

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const { themeMode } = storeToRefs(appStore)

const activePath = computed(() => route.path)

function onNavClick(to: string) {
  if (to !== activePath.value) router.push(to)
}

function onThemeModeChange(value: string | number | null) {
  appStore.setThemeMode(value as ThemeMode)
}
</script>

<template>
  <n-layout-header bordered style="height: 48px">
    <n-space justify="space-between" align="center" style="height: 100%; padding: 0 16px">
      <n-space align="center" :size="20">
        <n-text strong>uTools 插件模板</n-text>
        <n-space :size="4">
          <n-button
            v-for="item in NAV_ITEMS"
            :key="item.to"
            text
            :type="activePath === item.to ? 'primary' : 'default'"
            @click="onNavClick(item.to)"
          >
            {{ item.label }}
          </n-button>
        </n-space>
      </n-space>
      <n-space align="center" :size="8">
        <n-text depth="3" style="font-size: 12px">主题</n-text>
        <n-select
          size="small"
          style="width: 100px"
          :value="themeMode"
          :options="THEME_OPTIONS"
          @update:value="onThemeModeChange"
        />
      </n-space>
    </n-space>
  </n-layout-header>
</template>
