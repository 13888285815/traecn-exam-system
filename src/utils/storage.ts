/**
 * 本地存储工具模块
 * 封装 localStorage 操作，统一前缀管理
 */

const PREFIX = 'exam_'

/**
 * 存储工具对象
 */
export const storage = {
  /**
   * 获取存储值
   * @param key 存储键（不含前缀）
   * @returns 解析后的值，不存在返回 null
   */
  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      if (raw === null) return null
      try {
        return JSON.parse(raw) as T
      } catch {
        return raw as unknown as T
      }
    } catch (error) {
      console.error(`[storage] 读取失败: ${key}`, error)
      return null
    }
  },

  /**
   * 设置存储值
   * @param key 存储键（不含前缀）
   * @param value 要存储的值
   */
  set<T>(key: string, value: T): void {
    try {
      const raw = typeof value === 'string' ? value : JSON.stringify(value)
      localStorage.setItem(PREFIX + key, raw)
    } catch (error) {
      console.error(`[storage] 写入失败: ${key}`, error)
    }
  },

  /**
   * 移除指定存储项
   * @param key 存储键（不含前缀）
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(PREFIX + key)
    } catch (error) {
      console.error(`[storage] 移除失败: ${key}`, error)
    }
  },

  /**
   * 清除所有带前缀的存储项
   */
  clear(): void {
    try {
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(PREFIX)) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.error('[storage] 清除失败', error)
    }
  }
}

/** Token 存储键 */
export const TOKEN_KEY = 'exam_token'

/** 用户信息存储键 */
export const USER_KEY = 'exam_user'
