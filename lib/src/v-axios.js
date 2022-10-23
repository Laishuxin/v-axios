import axios from 'axios'
import { isFunction } from './utils'

export class VAxios {
  /**
   * @param { import('./typings').CreateAxiosOptions } options
   */
  constructor(options) {
    this._options = options
    this._axiosInstance = axios.create(options)
    this._setupInterceptor()
  }

  _setupInterceptor() {
    const { transform } = this._options
    const {
      requestInterceptors,
      requestInterceptorsCatch,
      responseInterceptors,
      responseInterceptorsCatch,
    } = transform || {}

    // 添加请求拦截器
    if (isFunction(requestInterceptors)) {
      this._axiosInstance.interceptors.request.use((config) => {
        // 为了针对不同请求进行处理，我们将实例化的 options 也一并传过去
        return requestInterceptors(config, this._options)
      })
    }

    // 添加请求异常拦截器
    if (isFunction(requestInterceptorsCatch)) {
      this._axiosInstance.interceptors.request.use(undefined, (error) => {
        return requestInterceptorsCatch(error, this._options)
      })
    }

    // 添加响应拦截器
    if (isFunction(responseInterceptors)) {
      // 后面我们会合并配置，所有的配置会存放到 res.config 下，所以我们只需要传 res
      this._axiosInstance.interceptors.response.use((res) => {
        return responseInterceptors(res)
      })
    }

    // 添加响应异常拦截器
    if (isFunction(responseInterceptorsCatch)) {
      this._axiosInstance.interceptors.response.use(undefined, (error) => {
        // 涉及到超时请求我们把 axiosInstance 也一并传过去
        // 方便超时进行请求
        return responseInterceptorsCatch(this._axiosInstance, error)
      })
    }
  }
}
