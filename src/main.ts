import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAppStore } from '@/stores/app'
import '@/assets/styles/index.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// 恢复本地持久化设置（依赖 pinia，需在其安装之后调用）
useAppStore().init()

app.mount('#app')
