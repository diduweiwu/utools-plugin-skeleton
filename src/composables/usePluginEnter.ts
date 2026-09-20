import { onPluginEnter } from '@/services/utools'
import type { PluginEnterAction } from '@/services/utools'

/**
 * 订阅插件进入事件。
 *
 * 只需在 App.vue 订阅一次，处理器中可结合 feature code 做路由跳转、
 * 把 payload 写入 store 等全局性的分发逻辑；
 * 各页面需要响应进入事件时，读取 store 中的 enterAction 即可。
 */
export function usePluginEnter(handler: (action: PluginEnterAction) => void): void {
  onPluginEnter(handler)
}
