<script setup lang="ts">
import { zhCN, dateZhCN } from 'naive-ui'
import { useRouter } from 'vue-router'

import AppHeader from '@/components/AppHeader.vue'
import { useTheme } from '@/composables/useTheme'
import { usePluginEnter } from '@/composables/usePluginEnter'
import { getFeatureRoute } from '@/router'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const appStore = useAppStore()
const { theme } = useTheme()

// 插件进入：记录动作信息，并按 feature code 跳转对应页面
usePluginEnter((action) => {
  appStore.setEnterAction(action)
  const path = getFeatureRoute(action.code)
  if (path && path !== router.currentRoute.value.path) {
    router.push(path)
  }
})
</script>

<template>
  <n-config-provider :theme="theme" :locale="zhCN" :date-locale="dateZhCN">
    <n-message-provider placement="top" :duration="2000">
      <n-dialog-provider>
        <n-layout position="absolute">
          <AppHeader />
          <n-layout
            position="absolute"
            style="top: 48px"
            :native-scrollbar="false"
            content-style="padding: 16px;"
          >
            <router-view />
          </n-layout>
        </n-layout>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>
