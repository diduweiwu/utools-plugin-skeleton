import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

// uTools 以相对路径加载打包产物，base 必须保持 './'
export default defineConfig({
  base: './',
  plugins: [
    vue(),
    Components({
      resolvers: [NaiveUiResolver()],
      dts: 'components.d.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // 显式绑定 IPv4：uTools 通过 http://127.0.0.1:5173/ 访问开发页面，
    // 而 Vite 默认的 localhost 在部分系统上只解析到 IPv6，会导致 uTools 加载失败
    host: '127.0.0.1',
    // 端口固定为 5173，与 public/plugin.json 中 development.main 保持一致，
    // 端口被占用时直接报错而不是自动顺延，避免 uTools 加载到错误的地址
    port: 5173,
    strictPort: true,
  },
})
