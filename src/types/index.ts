// ============================================================
// 用户相关类型
// ============================================================

/** 用户角色 */
export type UserRole = 'admin' | 'enterprise' | 'teacher' | 'student'

/** 会员类型 */
export type MemberType = 'free' | 'vip' | 'svip'

/** 用户 */
export interface User {
  id: number
  username: string
  name?: string
  email: string
  phone: string
  password: string
  avatar: string
  role: UserRole
  status: number
  memberType: MemberType
  memberExpireAt: string
  enterpriseId: number | null
  createdAt: string
  updatedAt: string
}

// ============================================================
// 企业相关类型
// ============================================================

/** 企业状态 */
export type EnterpriseStatus = 'pending' | 'active' | 'disabled'

/** 企业设置 */
export interface EnterpriseSettings {
  name: string
  logo: string
  description: string
  features: string[]
}

/** 企业 */
export interface Enterprise {
  id: number
  name: string
  logo: string
  description: string
  status: EnterpriseStatus
  adminId: number
  settings: EnterpriseSettings
  createdAt: string
}

// ============================================================
// 题库相关类型
// ============================================================

/** 题目类型 */
export type QuestionType = 'single' | 'multiple' | 'judge' | 'fill' | 'essay'

/** 题库 */
export interface QuestionBank {
  id: number
  name: string
  description: string
  category: string
  tags: string[]
  cover: string
  price: number
  isPublic: boolean
  ownerId: number
  ownerType: 'user' | 'enterprise'
  questionCount: number
  purchaseCount: number
  rating: number
  status: number
  createdAt: string
}

/** 题目 */
export interface Question {
  id: number
  bankId: number
  type: QuestionType
  content: string
  options: string[]
  answer: string
  analysis: string
  score: number
  difficulty: 1 | 2 | 3 | 4 | 5
  category: string
  tags: string[]
  isFavorite: boolean
  wrongCount: number
  createdAt: string
}

// ============================================================
// 试卷相关类型
// ============================================================

/** 试卷类型 */
export type ExamPaperType = 'practice' | 'formal' | 'mock'

/** 试卷设置 */
export interface PaperSettings {
  shuffleQuestions: boolean
  shuffleOptions: boolean
  showAnswer: boolean
  timedWarning: boolean
}

/** 试卷 */
export interface ExamPaper {
  id: number
  name: string
  description: string
  type: ExamPaperType
  duration: number
  totalScore: number
  passScore: number
  questionIds: number[]
  settings: PaperSettings
  ownerId: number
  status: number
  createdAt: string
}

// ============================================================
// 考试记录相关类型
// ============================================================

/** 考试状态 */
export type ExamStatus = 'not_started' | 'in_progress' | 'completed' | 'graded' | 'expired'

/** 用户答题 */
export interface UserAnswer {
  id: number
  userId: number
  examId: number
  questionId: number
  answer: string
  isCorrect: boolean
  timeSpent: number
}

/** 考试记录 */
export interface ExamRecord {
  id: number
  paperId: number
  userId: number
  examId?: number
  answers: UserAnswer[]
  score: number
  totalScore?: number
  status: ExamStatus
  startTime: string
  endTime: string
  duration?: number
  createdAt: string
}

// ============================================================
// 课程相关类型
// ============================================================

/** 课时 */
export interface Lesson {
  id: number
  title: string
  type: 'video' | 'text' | 'doc'
  content: string
  duration: number
}

/** 章节 */
export interface Chapter {
  id: number
  title: string
  lessons: Lesson[]
}

/** 课程 */
export interface Course {
  id: number
  name: string
  description: string
  cover: string
  chapters: Chapter[]
  price: number
  ownerId: number
  status: number
  createdAt: string
}

// ============================================================
// 订单相关类型
// ============================================================

/** 订单状态 */
export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'refunded'

/** 订单类型 */
export type OrderType = 'question_bank' | 'course' | 'membership'

/** 订单 */
export interface Order {
  id: number
  userId: number
  type: OrderType
  itemId: number
  itemName: string
  price: number
  status: OrderStatus
  createdAt: string
}

// ============================================================
// 群组相关类型
// ============================================================

/** 群组 */
export interface Group {
  id: number
  name: string
  description: string
  ownerId: number
  memberCount: number
  status: number
  createdAt: string
}

// ============================================================
// 通知与消息相关类型
// ============================================================

/** 通知类型 */
export type NoticeType = 'system' | 'enterprise' | 'exam' | 'course'

/** 通知 */
export interface Notice {
  id: number
  title: string
  content: string
  type: NoticeType
  enterpriseId: number | null
  createdAt: string
}

/** 消息类型 */
export type MessageType = 'text' | 'image' | 'file' | 'system'

/** 消息 */
export interface Message {
  id: number
  fromId: number
  toId: number
  content: string
  type: MessageType
  isRead: boolean
  createdAt: string
}

// ============================================================
// 日志与系统设置相关类型
// ============================================================

/** 日志条目 */
export interface LogEntry {
  id: number
  userId: number
  action: string
  detail: string
  ip: string
  createdAt: string
}

/** 系统设置 */
export interface SystemSettings {
  siteName: string
  logo: string
  icp: string
  copyright: string
  contactPhone: string
  contactEmail: string
  wechatQrCode: string
}

// ============================================================
// 兼容旧版类型（保留向后兼容）
// ============================================================

/** @deprecated 使用 ExamPaper 代替 */
export interface Exam {
  id: number
  title: string
  description?: string
  duration: number
  totalScore: number
  questions: Question[]
  createdAt: string
  status: 'draft' | 'published'
}

/** 分类 */
export interface Category {
  id: number
  name: string
  description?: string
}

/** 考试分类 */
export interface ExamCategory {
  id: number
  name: string
  description?: string
}

/** 错题 */
export interface WrongQuestion {
  id: number
  userId: number
  questionId: number
  question: Question
  userAnswer: string
  wrongCount: number
  lastWrongTime: string
}

/** 回收站项目 */
export interface RecycleItem {
  id: number
  type: 'question' | 'exam' | 'examRecord' | 'wrongQuestion'
  data: Question | Exam | ExamRecord | WrongQuestion
  deletedAt: string
  deletedBy: number
}

/** 错题回收站项目 */
export interface WrongQuestionRecycleItem {
  id: number
  userId: number
  questionId: number
  question: Question
  userAnswer: string
  wrongCount: number
  lastWrongTime: string
  deletedAt: string
}

/** 考试会话 */
export interface ExamSession {
  id: number
  userId: number
  examId: number
  questions: Question[]
  currentIndex: number
  answers: { questionId: number; answer: string; timeSpent: number }[]
  startTime: string
  endTime?: string
  mode: 'normal' | 'endless'
  status: 'in_progress' | 'completed' | 'exited'
}

/** 考试时间段 */
export interface ExamTimeSlot {
  id: number
  startTime: string
  endTime: string
  date: string
  examId: number
  maxParticipants: number
  currentParticipants: number
}

/** 错误分析 */
export interface ErrorAnalysis {
  questionId: number
  userId: number
  userAnswer: string
  correctAnswer: string
  wrongCount: number
  commonErrors: string[]
  suggestedReview: string
}
