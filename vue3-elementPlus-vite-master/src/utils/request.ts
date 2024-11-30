import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError
} from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

import router, { resetRoute } from '@/router'

function getSession(key: string) {
  let json: any = window.sessionStorage.getItem(key)
  return JSON.parse(json)
}

export const PATH_URL: string = import.meta.env.VITE_GLOB_API_URL as string

// 配置新建一个 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: PATH_URL,
  timeout: 50000,
  headers: { 'Content-Type': 'application/json;charset=UTF-8' }
})

// 添加请求拦截器
service.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    if (getSession('token')) {
      config.headers.common['Authorization'] = `${getSession('token')}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// 添加响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data
  },
  (error: AxiosError) => {
    if (error.message.indexOf('timeout') != -1) {
      ElMessage.error('网络超时')
    } else if (error.message == 'Network Error') {
      ElMessage.error('网络连接错误')
    } else {
      ElMessage.error(error.message)
    }
    return Promise.reject(error)
  }
)

export default service
