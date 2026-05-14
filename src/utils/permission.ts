/**
 * 权限控制模块
 */

/** 用户角色类型 */
export type UserRole = 'admin' | 'enterprise' | 'teacher' | 'student'

/** 权限标识 */
export type Permission =
  // 用户管理
  | 'user:view' | 'user:create' | 'user:edit' | 'user:delete'
  // 企业管理
  | 'enterprise:view' | 'enterprise:create' | 'enterprise:edit' | 'enterprise:delete' | 'enterprise:verify'
  // 题库管理
  | 'question:view' | 'question:create' | 'question:edit' | 'question:delete' | 'question:import' | 'question:export'
  // 试卷管理
  | 'exam:view' | 'exam:create' | 'exam:edit' | 'exam:delete' | 'exam:publish'
  // 考试管理
  | 'exam:take' | 'exam:result:view'
  // 课程管理
  | 'course:view' | 'course:create' | 'course:edit' | 'course:delete'
  // 订单管理
  | 'order:view' | 'order:create'
  // 系统管理
  | 'system:settings' | 'system:logs' | 'system:notice' | 'system:data:clean' | 'system:recycle'
  // 错题管理
  | 'wrong:view' | 'wrong:delete'

/** 菜单项 */
export interface MenuItem {
  name: string
  path: string
  icon?: string
  children?: MenuItem[]
}

/**
 * 角色权限映射
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // 全部权限
    'user:view', 'user:create', 'user:edit', 'user:delete',
    'enterprise:view', 'enterprise:create', 'enterprise:edit', 'enterprise:delete', 'enterprise:verify',
    'question:view', 'question:create', 'question:edit', 'question:delete', 'question:import', 'question:export',
    'exam:view', 'exam:create', 'exam:edit', 'exam:delete', 'exam:publish',
    'exam:take', 'exam:result:view',
    'course:view', 'course:create', 'course:edit', 'course:delete',
    'order:view', 'order:create',
    'system:settings', 'system:logs', 'system:notice', 'system:data:clean', 'system:recycle',
    'wrong:view', 'wrong:delete'
  ],
  enterprise: [
    // 企业管理权限
    'user:view', 'user:create', 'user:edit',
    'enterprise:view', 'enterprise:edit',
    'question:view', 'question:create', 'question:edit', 'question:delete', 'question:import', 'question:export',
    'exam:view', 'exam:create', 'exam:edit', 'exam:delete', 'exam:publish',
    'exam:take', 'exam:result:view',
    'course:view', 'course:create', 'course:edit',
    'order:view', 'order:create',
    'wrong:view', 'wrong:delete'
  ],
  teacher: [
    // 题库试卷权限
    'question:view', 'question:create', 'question:edit', 'question:delete', 'question:import', 'question:export',
    'exam:view', 'exam:create', 'exam:edit', 'exam:delete', 'exam:publish',
    'exam:take', 'exam:result:view',
    'course:view',
    'wrong:view'
  ],
  student: [
    // 学习考试权限
    'exam:view', 'exam:take', 'exam:result:view',
    'course:view',
    'order:view', 'order:create',
    'wrong:view', 'wrong:delete'
  ]
}

/**
 * 角色菜单映射
 */
const ROLE_MENUS: Record<UserRole, MenuItem[]> = {
  admin: [
    { name: '首页', path: '/', icon: 'home' },
    { name: '用户管理', path: '/admin/users', icon: 'users' },
    { name: '企业管理', path: '/admin/enterprises', icon: 'building' },
    { name: '题库管理', path: '/admin/questions', icon: 'database' },
    { name: '试卷管理', path: '/admin/exams', icon: 'file-text' },
    { name: '课程管理', path: '/admin/courses', icon: 'book' },
    { name: '订单管理', path: '/admin/orders', icon: 'shopping-cart' },
    { name: '系统设置', path: '/admin/settings', icon: 'settings' },
    { name: '系统日志', path: '/admin/logs', icon: 'file-search' },
    { name: '公告管理', path: '/admin/notices', icon: 'bell' },
    { name: '数据清理', path: '/admin/data-clean', icon: 'trash' },
    { name: '回收站', path: '/admin/recycle-bin', icon: 'archive' }
  ],
  enterprise: [
    { name: '首页', path: '/', icon: 'home' },
    { name: '企业信息', path: '/enterprise/info', icon: 'building' },
    { name: '题库管理', path: '/admin/questions', icon: 'database' },
    { name: '试卷管理', path: '/admin/exams', icon: 'file-text' },
    { name: '课程管理', path: '/admin/courses', icon: 'book' },
    { name: '订单管理', path: '/admin/orders', icon: 'shopping-cart' },
    { name: '错题本', path: '/wrong-questions', icon: 'alert-circle' }
  ],
  teacher: [
    { name: '首页', path: '/', icon: 'home' },
    { name: '题库管理', path: '/admin/questions', icon: 'database' },
    { name: '试卷管理', path: '/admin/exams', icon: 'file-text' },
    { name: '考试列表', path: '/exam/list', icon: 'list' },
    { name: '课程管理', path: '/admin/courses', icon: 'book' },
    { name: '错题本', path: '/wrong-questions', icon: 'alert-circle' }
  ],
  student: [
    { name: '首页', path: '/', icon: 'home' },
    { name: '考试列表', path: '/exam/list', icon: 'list' },
    { name: '我的课程', path: '/courses', icon: 'book' },
    { name: '我的订单', path: '/orders', icon: 'shopping-cart' },
    { name: '错题本', path: '/wrong-questions', icon: 'alert-circle' },
    { name: '错题回收站', path: '/wrong-question-recycle', icon: 'archive' }
  ]
}

/**
 * 检查角色是否拥有指定权限
 * @param role 用户角色
 * @param permission 权限标识
 * @returns 是否有权限
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  return permissions.includes(permission)
}

/**
 * 检查角色是否拥有任意一个指定权限
 * @param role 用户角色
 * @param permissions 权限标识数组
 * @returns 是否有任意一个权限
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p))
}

/**
 * 根据角色获取可访问菜单
 * @param role 用户角色
 * @returns 菜单项数组
 */
export function getAccessibleMenus(role: UserRole): MenuItem[] {
  return ROLE_MENUS[role] || []
}
