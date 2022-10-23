import axios from 'axios'
import { isFunction, toBoolean } from './utils'
import { VAxiosCanceller } from './v-axios-canceller'

export class VAxios {
  /**
   * @param { import('./typings').CreateAxiosOptions } options
   */
  constructor(options) {
    this._options = options || {}
    this._axiosInstance = axios.create(options)
    this._setupInterceptor()
    this._canceller = new VAxiosCanceller()
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
    // if (isFunction(requestInterceptors)) {
    //   this._axiosInstance.interceptors.request.use((config) => {
    //     // 为了针对不同请求进行处理，我们将实例化的 options 也一并传过去
    //     return requestInterceptors(config, this._options)
    //   })
    // }
    this._axiosInstance.interceptors.request.use((config) => {
      let canIgnore = true

      // 1. 读取当前请求配置
      if (
        config.requestOptions &&
        config.requestOptions.ignoreCancel !== undefined
      ) {
        canIgnore = config.requestOptions.ignoreCancel

        // 2. 读取全局配置
      } else if (
        this._options.requestOptions &&
        this._options.requestOptions.ignoreCancel !== undefined
      ) {
        canIgnore = this._options.requestOptions.ignoreCancel
      }

      if (canIgnore) {
        this._canceller.addPending(config)
      }

      if (isFunction(requestInterceptors)) {
        config = requestInterceptors(config, this._options)
      }

      // 注意把 config 返回
      return config
    })

    // 添加请求异常拦截器
    if (isFunction(requestInterceptorsCatch)) {
      this._axiosInstance.interceptors.request.use(undefined, (error) => {
        return requestInterceptorsCatch(error, this._options)
      })
    }

    // 添加响应拦截器
    // if (isFunction(responseInterceptors)) {
    //   // 后面我们会合并配置，所有的配置会存放到 res.config 下，所以我们只需要传 res
    //   this._axiosInstance.interceptors.response.use((res) => {
    //     return responseInterceptors(res)
    //   })
    // }

    this._axiosInstance.interceptors.response.use((res) => {
      if (res && res.config) {
        // 这里并不需要取消请求，因为请求已经得到响应了
        this._canceller.removePending(res.config)
      }

      if (isFunction(responseInterceptors)) {
        // 后面我们会合并配置，所有的配置会存放到 res.config 下，所以我们只需要传 res
        res = responseInterceptors(res)
      }

      return res
    })

    // 添加响应异常拦截器
    // if (isFunction(responseInterceptorsCatch)) {
    //   this._axiosInstance.interceptors.response.use(undefined, (error) => {
    //     // 涉及到超时请求我们把 axiosInstance 也一并传过去
    //     // 方便超时进行请求
    //     return responseInterceptorsCatch(this._axiosInstance, error)
    //   })
    // }

    this._axiosInstance.interceptors.response.use(undefined, (error) => {
      // 只有 axios error 才有可能携带 config
      if (axios.isAxiosError(error) && !axios.isCancel(error) && error.config) {
        this._canceller.removePending(error.config)
      }

      if (isFunction(responseInterceptorsCatch)) {
        // 涉及到超时请求我们把 axiosInstance 也一并传过去
        // 方便超时进行请求
        return responseInterceptorsCatch(this._axiosInstance, error)
      }

      throw error
    })
  }
}
