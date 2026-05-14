/**
 * 安全工具模块
 * 包含哈希、ID生成、脱敏、输入清理等功能
 */

const PASSWORD_SALT = 'exam-system-salt-2024'

/**
 * 简单哈希函数（兼容非 HTTPS 环境）
 * 使用 FNV-1a + 简单混合，确保本地开发可用
 * 生产环境建议替换为 bcrypt/Argon2
 */
export function simpleHash(str: string): string {
  let hash1 = 0x811c9dc5
  let hash2 = 0x01000193
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    hash1 ^= ch
    hash1 = Math.imul(hash1, 0x01000193)
    hash2 ^= ch
    hash2 = Math.imul(hash2, 0x811c9dc5)
  }
  hash1 ^= hash1 >>> 16
  hash2 ^= hash2 >>> 16
  hash1 = Math.imul(hash1, 0x85ebca6b)
  hash2 = Math.imul(hash2, 0xc2b2ae35)
  hash1 ^= hash1 >>> 13
  hash2 ^= hash2 >>> 15
  hash1 = Math.imul(hash1, 0xae506287)
  hash2 = Math.imul(hash2, 0x1b873593)
  hash1 ^= hash1 >>> 15
  hash2 ^= hash2 >>> 16
  const combined = ((hash1 >>> 0) * 4096 + (hash2 >>> 0)).toString(16)
  return combined.padStart(16, '0')
}

/**
 * 密码哈希（优先使用 Web Crypto API，降级到 simpleHash）
 */
export async function hashPassword(password: string): Promise<string> {
  if (crypto.subtle) {
    try {
      const encoder = new TextEncoder()
      const data = encoder.encode(password + PASSWORD_SALT)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    } catch {
      // fallback
    }
  }
  return simpleHash(password + PASSWORD_SALT)
}

/**
 * 验证密码
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const hashedInput = await hashPassword(password)
  return hashedInput === hashedPassword
}

/**
 * 生成唯一 ID
 * 格式: 时间戳(13位) + 随机数(4位)
 */
export function generateId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return timestamp + random
}

/**
 * 邮箱脱敏
 * 例: zhangsan@example.com -> z***n@example.com
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email
  const [name, domain] = email.split('@')
  if (name.length <= 2) return '***@' + domain
  return name[0] + '***' + name[name.length - 1] + '@' + domain
}

/**
 * 手机号脱敏
 * 例: 13800138000 -> 138****8000
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return phone
  return phone.substring(0, 3) + '****' + phone.substring(phone.length - 4)
}

/**
 * 输入清理 - 移除危险字符和 XSS 风险内容
 */
export function sanitizeInput(input: string): string {
  if (!input) return ''
  let sanitized = input
  // 移除 HTML 标签
  sanitized = sanitized.replace(/<[^>]*>/g, '')
  // 移除 HTML 实体
  sanitized = sanitized.replace(/&[a-zA-Z]+;/g, '')
  sanitized = sanitized.replace(/&#\d+;/g, '')
  // 移除危险模式
  const dangerousPatterns = [
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /data:/gi,
    /vbscript:/gi
  ]
  for (const pattern of dangerousPatterns) {
    sanitized = sanitized.replace(pattern, '')
  }
  return sanitized.replace(/\s+/g, ' ').trim()
}

/**
 * 安全存储工具（兼容旧版代码）
 * 使用 localStorage 进行数据持久化，支持 JSON 序列化/反序列化
 */
export const secureStorage = {
  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) as T : null
    } catch {
      return null
    }
  },

  setItem(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage full or other error
    }
  },

  removeItem(key: string): void {
    localStorage.removeItem(key)
  }
}
