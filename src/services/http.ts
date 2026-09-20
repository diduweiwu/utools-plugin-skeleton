/**
 * HTTP 客户端统一出口
 *
 * 业务模块从本模块导入 request 实例发请求，
 * 不要在业务代码里直接 `axios.get(...)`，避免超时、拦截器等配置散落各处。
 */
import axios from 'axios'

const request = axios.create({
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

request.interceptors.request.use((config) => {
  // 需要鉴权时可在此统一注入 token
  return config
})

request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error?.response?.data?.message ?? error?.message ?? '网络请求失败'
    return Promise.reject(new Error(message))
  },
)

export default request
