/**
 * 通用工具模块
 */

/**
 * 日期格式化
 * @param date 日期对象或日期字符串
 * @param format 格式模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | string, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 秒数转时分秒
 * @param seconds 总秒数
 * @returns 格式化字符串，如 '01:23:45'
 */
export function formatTime(seconds: number): string {
  if (!seconds || seconds < 0) return '00:00:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}

/**
 * 生成模拟 ID
 * 格式: Date.now() + 4位随机数
 */
export function generateMockId(): number {
  return Date.now() + Math.floor(Math.random() * 10000)
}

/**
 * 防抖函数
 * @param fn 要防抖的函数
 * @param delay 延迟毫秒数，默认 300ms
 */
export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number = 300): T {
  let timer: ReturnType<typeof setTimeout> | null = null
  return function (this: any, ...args: any[]) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  } as unknown as T
}

/**
 * 节流函数
 * @param fn 要节流的函数
 * @param delay 间隔毫秒数，默认 300ms
 */
export function throttle<T extends (...args: any[]) => any>(fn: T, delay: number = 300): T {
  let lastTime = 0
  return function (this: any, ...args: any[]) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      fn.apply(this, args)
      lastTime = now
    }
  } as unknown as T
}

/**
 * 深拷贝
 * @param obj 要拷贝的对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
  if (obj instanceof RegExp) return new RegExp(obj.source, obj.flags) as unknown as T
  if (Array.isArray(obj)) return obj.map(item => deepClone(item)) as unknown as T

  const cloned = {} as T
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key])
    }
  }
  return cloned
}

/**
 * 获取难度文本
 * @param level 难度等级 1-3
 */
export function getDifficultyText(level: 1 | 2 | 3): string {
  const map: Record<number, string> = {
    1: '简单',
    2: '中等',
    3: '困难'
  }
  return map[level] || '未知'
}

/**
 * 获取题型文本
 * @param type 题目类型
 */
export function getQuestionTypeText(type: string): string {
  const map: Record<string, string> = {
    single: '单选题',
    multiple: '多选题',
    judge: '判断题',
    fill: '填空题',
    essay: '问答题'
  }
  return map[type] || '未知'
}

/**
 * 获取状态文本
 * @param status 状态标识
 */
export function getStatusText(status: string): string {
  const map: Record<string, string> = {
    draft: '草稿',
    published: '已发布',
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝',
    active: '进行中',
    completed: '已完成',
    expired: '已过期',
    cancelled: '已取消',
    verified: '已认证',
    unverified: '未认证',
    free: '免费版',
    vip: 'VIP',
    svip: 'SVIP'
  }
  return map[status] || status
}
