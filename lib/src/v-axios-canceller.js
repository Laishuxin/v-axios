import { normalizeHttpMethod } from './utils'

/**
 * 获取请求的唯一标识。
 * @param { import("axios").AxiosRequestConfig } config
 * @returns { string }
 */
function getIdentifier(config) {
  let { method, url, params } = config
  method = normalizeHttpMethod(method)
  url = url || ''
  params = JSON.stringify(params || {})
  return [method, url, params].join('&')
}

export class VAxiosCanceller {
  constructor() {
    /**
     * @type { Map<string, AbortController> }
     */
    this._identifierToCancellerMap = new Map()
  }

  /**
   * @param { import("axios").AxiosRequestConfig } config
   */
  addPending(config) {
    if (config.signal != null) return

    // 取消重复请求，并删除缓存
    this.removeAndCancelPending(config)

    const identifier = getIdentifier(config)
    // 将当前请求存储到 map中
    // 控制判断是为了兼容手动取消
    const controller = new AbortController()
    config.signal = controller.signal
    this._identifierToCancellerMap.set(identifier, controller)
  }

  /**
   * 取消重复请求，并删除缓存
   * @param { import("axios").AxiosRequestConfig } config
   */
  removeAndCancelPending(config) {
    const identifier = getIdentifier(config)
    const controller = this._identifierToCancellerMap.get(identifier)
    // 存在重复请求
    if (controller != null) {
      controller.abort()
      config.signal = null
      this._identifierToCancellerMap.delete(identifier)
    }
  }

  /**
   * 删除缓存，但不取消请求
   * @param { import("axios").AxiosRequestConfig } config
   */
  removePending(config) {
    const identifier = getIdentifier(config)
    if (this._identifierToCancellerMap.has(identifier)) {
      this._identifierToCancellerMap.delete(identifier)
    }
  }

  /**
   * 取消所有的请求，并清空缓存
   */
  removeAndCancelAllPending() {
    this._identifierToCancellerMap.forEach((controller) => controller.abort())
    this._identifierToCancellerMap.clear()
  }

  /**
   * 重置缓存
   */
  reset() {
    this._identifierToCancellerMap = new Map()
  }
}
