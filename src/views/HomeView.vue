<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useMessage } from "naive-ui";

import {
  copyText,
  getPlatformName,
  onPluginEnter,
  onPluginOut,
  readFileText,
  setSubInput,
  showItemInFolder,
  showNotification,
  userDataDirectory,
  whenPlatformReady,
  writeFileText,
} from "@/platform";
import { loadJsonStorage, saveJsonStorage } from "@/composables/use-storage";

/**
 * 通用示例页:集中演示脚手架接好的平台能力,作为接入自己业务的起点。
 * - 平台识别与生命周期(onPluginEnter / onPluginOut,关键词与 over 两种触发)
 * - 副输入框(setSubInput)
 * - dbStorage 持久化(use-storage 封装)
 * - 系统通知 / 剪贴板
 * - preload 注入的 Node 文件能力(读写用户数据目录)
 */

/** 演示数据统一持久化在 dbStorage,重进插件不丢失 */
const STORAGE_KEY = "skeleton-demo";

type EnterAction = { code: string; type: string; payload: string };
type DemoState = { counter: number; note: string; noteFile: string };

const message = useMessage();

const platformLabel = ref(getPlatformName() ?? "模拟器(平台未注入)");
const enterAction = ref<EnterAction | null>(null);
const counter = ref(0);
const subInputText = ref("");
const note = ref("");
const noteFile = ref("");

const persist = (): void => {
  const state: DemoState = { counter: counter.value, note: note.value, noteFile: noteFile.value };
  saveJsonStorage(STORAGE_KEY, state);
};

onMounted(() => {
  whenPlatformReady(() => {
    const saved = loadJsonStorage<Partial<DemoState>>(STORAGE_KEY);
    counter.value = saved.counter ?? 0;
    note.value = saved.note ?? "";
    noteFile.value = saved.noteFile ?? "";

    // 关键词或 over(选中文字)触发进入都会回调,payload 为触发时携带的内容
    onPluginEnter((action) => {
      enterAction.value = action;
    });

    // 插件隐藏/退出时触发;isKill 为 true 表示进程被结束
    onPluginOut((isKill) => {
      if (!isKill) {
        persist();
      }
    });

    // 副输入框内容实时回显到页面
    setSubInput(({ text }) => {
      subInputText.value = text;
    }, "输入内容会实时回显到页面");
  });
});

const bumpCounter = (delta: number): void => {
  counter.value += delta;
  persist();
};

const saveNote = (): void => {
  try {
    noteFile.value = writeFileText(`${userDataDirectory()}/skeleton-demo.txt`, note.value);
    persist();
    message.success("已保存到用户数据目录");
  } catch (error) {
    message.error(`保存失败:${error instanceof Error ? error.message : String(error)}`);
  }
};

const readNote = (): void => {
  try {
    note.value = readFileText(noteFile.value);
    persist();
    message.success("已读取");
  } catch {
    message.error("读取失败,文件可能已被移除");
  }
};

const locateNote = (): void => {
  showItemInFolder(noteFile.value);
};

const copyNote = (): void => {
  if (copyText(note.value)) {
    message.success("已复制到剪贴板");
  } else {
    message.error("复制失败");
  }
};

const notify = (): void => {
  showNotification("来自插件骨架的系统通知");
};
</script>

<template>
  <n-space vertical size="large" class="demo">
    <n-card title="平台与生命周期" size="small">
      <n-space vertical size="small">
        <n-space align="center">
          <n-tag type="info">{{ platformLabel }}</n-tag>
          <n-tag v-if="enterAction" type="success">code: {{ enterAction.code }}</n-tag>
        </n-space>
        <n-alert v-if="enterAction" :bordered="false">
          最近一次进入:type={{ enterAction.type }},payload={{ enterAction.payload || "(空)" }}
        </n-alert>
        <span class="tip">
          关键词 hello / 你好 进入本页;也可以选中文字后在搜索框里触发「处理选中文本」,payload 会显示在这里。
        </span>
      </n-space>
    </n-card>

    <n-card title="副输入框" size="small">
      <span :class="{ tip: !subInputText }">
        {{ subInputText || "(在插件顶部的副输入框输入,内容会实时回显到这里)" }}
      </span>
    </n-card>

    <n-card title="dbStorage 持久化" size="small">
      <n-space align="center">
        <n-button @click="bumpCounter(-1)">-1</n-button>
        <n-tag size="large">{{ counter }}</n-tag>
        <n-button @click="bumpCounter(1)">+1</n-button>
        <span class="tip">数值存放在平台 dbStorage,退出重进后仍在。</span>
      </n-space>
    </n-card>

    <n-card title="preload 注入的 Node 能力" size="small">
      <n-space vertical size="small">
        <n-input
          v-model:value="note"
          type="textarea"
          :rows="3"
          placeholder="写点什么,保存到平台用户数据目录"
        />
        <n-space>
          <n-button type="primary" @click="saveNote">保存</n-button>
          <n-button :disabled="!noteFile" @click="readNote">读取</n-button>
          <n-button :disabled="!noteFile" @click="locateNote">在文件夹中显示</n-button>
          <n-button :disabled="!note" @click="copyNote">复制文本</n-button>
          <n-button @click="notify">系统通知</n-button>
        </n-space>
        <span v-if="noteFile" class="tip">{{ noteFile }}</span>
      </n-space>
    </n-card>
  </n-space>
</template>

<style scoped>
.demo {
  width: 100%;
  box-sizing: border-box;
  padding: 16px;
}

.tip {
  font-size: 12px;
  opacity: 0.65;
}
</style>
