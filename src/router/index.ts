import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

/**
 * feature code → 路由路径映射
 * 在 public/plugin.json 中新增 feature 后，在这里登记它对应的页面
 */
export const FEATURE_ROUTE_MAP: Record<string, string> = {
  demo: '/',
  'demo-over': '/',
}

export function getFeatureRoute(code: string): string | undefined {
  return FEATURE_ROUTE_MAP[code]
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/home/HomeView.vue'),
    meta: { title: '首页' },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/settings/SettingsView.vue'),
    meta: { title: '设置' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

/**
 * uTools 以 file 协议加载构建产物，
 * 必须使用 hash 模式路由，否则刷新或直接访问子路径会 404
 */
const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
