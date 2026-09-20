<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMessage } from 'naive-ui'

import { copyText } from '@/services/utools'
import { useAppStore } from '@/stores/app'

const message = useMessage()
const appStore = useAppStore()
const { enterAction } = storeToRefs(appStore)

const text = ref('Hello uTools!')

function handleCopy() {
  copyText(text.value)
  message.success('已复制到剪贴板')
}
</script>

<template>
  <n-space vertical :size="16">
    <n-card title="插件进入信息" size="small">
      <template #header-extra>
        <n-text depth="3" style="font-size: 12px">来自 store.enterAction</n-text>
      </template>
      <n-descriptions v-if="enterAction" bordered :column="1" size="small">
        <n-descriptions-item label="feature code">
          {{ enterAction.code }}
        </n-descriptions-item>
        <n-descriptions-item label="触发方式">
          {{ enterAction.type }}
        </n-descriptions-item>
        <n-descriptions-item label="payload">
          <n-text code>{{ JSON.stringify(enterAction.payload) }}</n-text>
        </n-descriptions-item>
      </n-descriptions>
      <n-empty
        v-else
        size="small"
        description="尚未触发插件进入，在 uTools 中输入关键字「demo」或选中文字进入后可见"
      />
    </n-card>

    <n-card title="示例：调用 services 层复制文本" size="small">
      <n-space>
        <n-input v-model:value="text" style="width: 320px" />
        <n-button type="primary" @click="handleCopy">复制并提示</n-button>
      </n-space>
    </n-card>
  </n-space>
</template>
