import { merge } from 'lodash-es'
export { clone, cloneDeep, isFunction, isString } from 'lodash-es'

/**
 * 浅合并对象，返回一个全新的对象，并且不会影响原有的对象。
 */
export function shallowMerge(...objects) {
  return Object.assign({}, ...objects)
}

/**
 * 深合并对象，返回一个全新的对象，并且不会影响原有的对象。
 */
export function deepMerge(...objects) {
  return merge({}, ...objects)
}

/**
 * 将 v 强制转为 boolean
 * @param {*} v
 * @returns { boolean }
 */
export function toBoolean(v) {
  return !!v
}

/**
 * 延迟执行
 * @param { number } timeout
 */
export function sleep(timeout) {
  return new Promise((resolve) => setTimeout(resolve, timeout))
}

export const delay = sleep

/**
 * 空值判断
 * @param { unknown } v 
 * @returns 
 */
export function isVoid(v) {
  return v === null || v === undefined || v === ''
}
