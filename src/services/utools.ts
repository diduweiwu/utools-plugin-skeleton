/**
 * uTools API 统一出口（防腐层）
 *
 * 业务代码（views / stores / components）不要直接使用全局 `utools`，
 * 统一从本模块导入，好处：
 * 1. 对 uTools 环境的依赖收敛到一处，单测时 mock 本模块即可；
 * 2. uTools API 变动、或迁移到其他运行环境时只需修改这里；
 * 3. 在普通浏览器里直接访问 dev 页面时自动降级为 no-op，方便纯前端调试。
 */

/** 插件进入时携带的动作信息（由 utools.onPluginEnter 回调给出） */
export type PluginEnterAction = Parameters<Parameters<typeof utools.onPluginEnter>[0]>[0]

/** 当前是否运行在 uTools 环境中 */
export const isUtoolsEnv = typeof utools !== 'undefined'

/* ----------------------------- 生命周期 ----------------------------- */

/** 订阅插件进入事件（关键字、粘贴/复制等 feature 触发） */
export function onPluginEnter(callback: (action: PluginEnterAction) => void): void {
  if (!isUtoolsEnv) return
  utools.onPluginEnter(callback)
}

/** 订阅插件隐藏/退出事件 */
export function onPluginOut(callback: (processExit: boolean) => void): void {
  if (!isUtoolsEnv) return
  utools.onPluginOut(callback)
}

/* ----------------------------- 窗口交互 ----------------------------- */

/** 退出插件（隐藏 uTools 主窗口） */
export function outPlugin(): void {
  if (!isUtoolsEnv) return
  utools.outPlugin()
}

/** 隐藏主窗口 */
export function hideMainWindow(): void {
  if (!isUtoolsEnv) return
  utools.hideMainWindow()
}

/** 弹出系统通知 */
export function showNotification(body: string): void {
  if (!isUtoolsEnv) return
  utools.showNotification(body)
}

/** 复制文本到剪贴板 */
export function copyText(text: string): boolean {
  if (!isUtoolsEnv) return false
  return utools.copyText(text)
}

/* ------------------------------ 数据库 ------------------------------ */
/**
 * 约定：所有持久化文档的业务数据统一放在 `data` 字段下，
 * 通过 dbGet / dbPut 读写，屏蔽 _id / _rev 细节。
 */

export function dbGet<T>(id: string): T | null {
  if (!isUtoolsEnv) return null
  const doc = utools.db.get<{ data: T }>(id)
  return doc ? doc.data : null
}

export function dbPut<T>(id: string, data: T): void {
  if (!isUtoolsEnv) return
  const prev = utools.db.get(id)
  const result = prev ? utools.db.put({ ...prev, data }) : utools.db.put({ _id: id, data })
  if (result.error) {
    throw new Error(`uTools db 写入失败: ${result.message ?? '未知错误'}`)
  }
}

export function dbRemove(id: string): void {
  if (!isUtoolsEnv) return
  utools.db.remove(id)
}
