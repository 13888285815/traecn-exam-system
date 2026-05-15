/**
 * 应用配置常量
 *
 * 全局配置项、下拉选项、侧边栏菜单等集中管理。
 */

import { QuestionType, ExamStatus, UserRole, MemberType, OrderStatus, EnterpriseStatus } from './enum'

// ============================================================
// 应用基础配置
// ============================================================

/** 应用名称 */
export const APP_NAME = '云南意念科技在线考试系统'

/** 应用版本 */
export const APP_VERSION = '1.0.0'

/** 默认头像 */
export const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/thumbs/svg?seed=default'

// ============================================================
// 下拉选项配置
// ============================================================

/** 选项通用结构 */
export interface SelectOption<T = string | number> {
  label: string
  value: T
}

/** 题目类型选项（用于下拉选择） */
export const QUESTION_TYPE_OPTIONS: SelectOption[] = [
  { label: '单选题', value: QuestionType.Single },
  { label: '多选题', value: QuestionType.Multiple },
  { label: '判断题', value: QuestionType.Judge },
  { label: '填空题', value: QuestionType.Fill },
  { label: '问答题', value: QuestionType.Essay },
]

/** 难度选项 */
export const DIFFICULTY_OPTIONS: SelectOption<number>[] = [
  { label: '1 - 非常简单', value: 1 },
  { label: '2 - 简单', value: 2 },
  { label: '3 - 中等', value: 3 },
  { label: '4 - 困难', value: 4 },
  { label: '5 - 非常困难', value: 5 },
]

/** 会员类型选项 */
export const MEMBER_TYPE_OPTIONS: SelectOption[] = [
  { label: '免费用户', value: MemberType.Free },
  { label: '基础会员', value: MemberType.Basic },
  { label: '高级会员', value: MemberType.Premium },
]

/** 试卷类型选项 */
export const EXAM_TYPE_OPTIONS: SelectOption[] = [
  { label: '练习考试', value: 'practice' },
  { label: '正式考试', value: 'formal' },
  { label: '模拟考试', value: 'mock' },
]

/** 学科分类选项 */
export const CATEGORY_OPTIONS: SelectOption[] = [
  { label: '信息技术', value: '信息技术' },
  { label: '数学', value: '数学' },
  { label: '英语', value: '英语' },
  { label: '语文', value: '语文' },
  { label: '物理', value: '物理' },
  { label: '化学', value: '化学' },
  { label: '生物', value: '生物' },
  { label: '历史', value: '历史' },
  { label: '地理', value: '地理' },
  { label: '道德与法制', value: '道德与法制' },
  { label: '美术', value: '美术' },
  { label: '音乐', value: '音乐' },
  { label: '体育', value: '体育' },
  { label: '其他', value: '其他' },
]

// ============================================================
// 侧边栏菜单配置
// ============================================================

/** 菜单项结构 */
export interface MenuItem {
  path: string
  title: string
  icon: string
  children?: MenuItem[]
}

/** 后台侧边栏菜单 */
export const SIDEBAR_MENU: MenuItem[] = [
  // ----------------------------------------------------------
  // 题库管理（6项）
  // ----------------------------------------------------------
  {
    path: '/question-bank',
    title: '题库管理',
    icon: '📚',
    children: [
      { path: '/question-bank/my-banks', title: '我的题库', icon: '📖' },
      { path: '/question-bank/public-banks', title: '公共题库', icon: '🌐' },
      { path: '/question-bank/import', title: '导入题目', icon: '📥' },
      { path: '/question-bank/export', title: '导出题目', icon: '📤' },
      { path: '/question-bank/favorites', title: '收藏题目', icon: '⭐' },
      { path: '/question-bank/recycle', title: '回收站', icon: '🗑️' },
    ],
  },

  // ----------------------------------------------------------
  // 试卷管理（3项）
  // ----------------------------------------------------------
  {
    path: '/exam-paper',
    title: '试卷管理',
    icon: '📝',
    children: [
      { path: '/exam-paper/my-papers', title: '我的试卷', icon: '📄' },
      { path: '/exam-paper/create', title: '组卷中心', icon: '✏️' },
      { path: '/exam-paper/records', title: '考试记录', icon: '📊' },
    ],
  },

  // ----------------------------------------------------------
  // 我的群组（2项）
  // ----------------------------------------------------------
  {
    path: '/group',
    title: '我的群组',
    icon: '👥',
    children: [
      { path: '/group/my-groups', title: '我的群组', icon: '🏠' },
      { path: '/group/joined', title: '已加入群组', icon: '🤝' },
    ],
  },

  // ----------------------------------------------------------
  // 企业管理（16项）
  // ----------------------------------------------------------
  {
    path: '/enterprise',
    title: '企业管理',
    icon: '🏢',
    children: [
      { path: '/enterprise/overview', title: '企业概览', icon: '📈' },
      { path: '/enterprise/settings', title: '企业设置', icon: '⚙️' },
      { path: '/enterprise/members', title: '成员管理', icon: '👤' },
      { path: '/enterprise/departments', title: '部门管理', icon: '🏗️' },
      { path: '/enterprise/roles', title: '角色权限', icon: '🔑' },
      { path: '/enterprise/invitation', title: '邀请管理', icon: '✉️' },
      { path: '/enterprise/statistics', title: '数据统计', icon: '📊' },
      { path: '/enterprise/exam-manage', title: '考试管理', icon: '📋' },
      { path: '/enterprise/paper-manage', title: '试卷管理', icon: '📝' },
      { path: '/enterprise/question-manage', title: '题目管理', icon: '❓' },
      { path: '/enterprise/course-manage', title: '课程管理', icon: '🎓' },
      { path: '/enterprise/certificate', title: '证书管理', icon: '🏅' },
      { path: '/enterprise/announcement', title: '公告管理', icon: '📢' },
      { path: '/enterprise/log', title: '操作日志', icon: '📋' },
      { path: '/enterprise/notice', title: '通知管理', icon: '🔔' },
      { path: '/enterprise/audit', title: '审核管理', icon: '✅' },
    ],
  },

  // ----------------------------------------------------------
  // 账户管理（10项）
  // ----------------------------------------------------------
  {
    path: '/account',
    title: '账户管理',
    icon: '👤',
    children: [
      { path: '/account/profile', title: '个人信息', icon: '🪪' },
      { path: '/account/security', title: '安全设置', icon: '🔒' },
      { path: '/account/password', title: '修改密码', icon: '🔑' },
      { path: '/account/avatar', title: '头像设置', icon: '📷' },
      { path: '/account/notification', title: '消息通知', icon: '🔔' },
      { path: '/account/orders', title: '我的订单', icon: '🛒' },
      { path: '/account/membership', title: '会员中心', icon: '👑' },
      { path: '/account/courses', title: '我的课程', icon: '🎓' },
      { path: '/account/certificates', title: '我的证书', icon: '🏅' },
      { path: '/account/login-log', title: '登录日志', icon: '📋' },
    ],
  },

  // ----------------------------------------------------------
  // 系统设置（10项）
  // ----------------------------------------------------------
  {
    path: '/system',
    title: '系统设置',
    icon: '⚙️',
    children: [
      { path: '/system/basic', title: '基本设置', icon: '🌐' },
      { path: '/system/site', title: '站点配置', icon: '🖥️' },
      { path: '/system/email', title: '邮件设置', icon: '📧' },
      { path: '/system/storage', title: '存储设置', icon: '💾' },
      { path: '/system/payment', title: '支付设置', icon: '💳' },
      { path: '/system/wechat', title: '微信设置', icon: '💬' },
      { path: '/system/security', title: '安全设置', icon: '🛡️' },
      { path: '/system/backup', title: '备份恢复', icon: '📦' },
      { path: '/system/clean', title: '数据清理', icon: '🧹' },
      { path: '/system/about', title: '关于系统', icon: 'ℹ️' },
    ],
  },

  // ----------------------------------------------------------
  // 控制中心（4项）
  // ----------------------------------------------------------
  {
    path: '/control',
    title: '控制中心',
    icon: '🎛️',
    children: [
      { path: '/control/dashboard', title: '数据看板', icon: '📊' },
      { path: '/control/monitor', title: '系统监控', icon: '📡' },
      { path: '/control/schedule', title: '定时任务', icon: '⏰' },
      { path: '/control/queue', title: '任务队列', icon: '📋' },
    ],
  },

  // ----------------------------------------------------------
  // 帮助支持（4项）
  // ----------------------------------------------------------
  {
    path: '/help',
    title: '帮助支持',
    icon: '❓',
    children: [
      { path: '/help/guide', title: '使用指南', icon: '📖' },
      { path: '/help/faq', title: '常见问题', icon: '💬' },
      { path: '/help/feedback', title: '意见反馈', icon: '💭' },
      { path: '/help/contact', title: '联系我们', icon: '📞' },
    ],
  },
]
