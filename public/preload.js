'use strict'

/**
 * uTools preload 脚本
 *
 * - 运行在插件的 preload 环境，可直接使用 Node.js / Electron 能力
 * - 本文件不受 Vite 处理：放在 public/ 下，构建时原样拷贝到 dist/
 * - 在这里通过 window 暴露的方法，可在渲染层（src/）直接调用
 * - 渲染层对 utools API 的统一封装见 src/services/utools.ts
 * - 官方文档: https://developer.u-tools.cn/
 */

// 示例：向渲染层暴露数据/方法（可在渲染层通过 window.services 访问）
window.services = {
  platform: process.platform,
}
