/**
 * 表单验证工具模块
 */

/**
 * 邮箱验证
 */
export function isEmail(value: string): boolean {
  if (!value) return false
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(value)
}

/**
 * 手机号验证（中国大陆手机号）
 */
export function isPhone(value: string): boolean {
  if (!value) return false
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(value)
}

/**
 * 密码强度验证
 * 规则：至少6位，包含字母和数字
 */
export function isPassword(value: string): boolean {
  if (!value) return false
  if (value.length < 6) return false
  const hasLetter = /[a-zA-Z]/.test(value)
  const hasNumber = /\d/.test(value)
  return hasLetter && hasNumber
}

/**
 * 必填验证
 */
export function isRequired(value: any): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}

/** 验证规则定义 */
export interface ValidateRule {
  /** 字段名（用于错误提示） */
  label?: string
  /** 是否必填 */
  required?: boolean
  /** 自定义验证函数 */
  validator?: (value: any) => boolean
  /** 自定义错误消息 */
  message?: string
  /** 邮箱验证 */
  email?: boolean
  /** 手机号验证 */
  phone?: boolean
  /** 密码验证 */
  password?: boolean
  /** 最小长度 */
  minLength?: number
  /** 最大长度 */
  maxLength?: number
  /** 最小值（数字） */
  min?: number
  /** 最大值（数字） */
  max?: number
}

/** 验证结果 */
export interface ValidateResult {
  /** 是否通过 */
  valid: boolean
  /** 错误信息列表 */
  errors: { field: string; message: string }[]
}

/**
 * 通用表单验证函数
 * @param rules 验证规则对象 { 字段名: 规则 }
 * @param data 表单数据对象
 * @returns 验证结果
 */
export function validateForm(
  rules: Record<string, ValidateRule>,
  data: Record<string, any>
): ValidateResult {
  const errors: { field: string; message: string }[] = []

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field]
    const label = rule.label || field

    // 必填验证
    if (rule.required && !isRequired(value)) {
      errors.push({ field, message: rule.message || `${label}不能为空` })
      continue
    }

    // 如果值不存在且非必填，跳过后续验证
    if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
      continue
    }

    // 邮箱验证
    if (rule.email && !isEmail(value)) {
      errors.push({ field, message: rule.message || `${label}格式不正确` })
      continue
    }

    // 手机号验证
    if (rule.phone && !isPhone(value)) {
      errors.push({ field, message: rule.message || `${label}格式不正确` })
      continue
    }

    // 密码验证
    if (rule.password && !isPassword(value)) {
      errors.push({ field, message: rule.message || `${label}至少6位，需包含字母和数字` })
      continue
    }

    // 最小长度
    if (rule.minLength !== undefined && typeof value === 'string' && value.length < rule.minLength) {
      errors.push({ field, message: rule.message || `${label}至少${rule.minLength}个字符` })
      continue
    }

    // 最大长度
    if (rule.maxLength !== undefined && typeof value === 'string' && value.length > rule.maxLength) {
      errors.push({ field, message: rule.message || `${label}最多${rule.maxLength}个字符` })
      continue
    }

    // 最小值
    if (rule.min !== undefined && typeof value === 'number' && value < rule.min) {
      errors.push({ field, message: rule.message || `${label}不能小于${rule.min}` })
      continue
    }

    // 最大值
    if (rule.max !== undefined && typeof value === 'number' && value > rule.max) {
      errors.push({ field, message: rule.message || `${label}不能大于${rule.max}` })
      continue
    }

    // 自定义验证
    if (rule.validator && !rule.validator(value)) {
      errors.push({ field, message: rule.message || `${label}验证失败` })
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
