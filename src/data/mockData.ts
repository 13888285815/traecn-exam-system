/**
 * 模拟数据模块
 * 密码哈希使用 simpleHash(password + salt)，salt = 'exam-system-salt-2024'
 *
 * 哈希值（已预计算）：
 *   admin123 -> 000007f9805ce73d
 *   ent123   -> 000001db5aab9fd8
 *   tea123   -> 0000043cc1de2fd7
 *   stu123   -> 000000fcd46197f6
 */

import type { User, Question, Exam, Category } from '../types'

// ============================================================
// 用户数据
// ============================================================

export const mockUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    password: '000007f9805ce73d',
    role: 'admin',
    name: '系统管理员',
    email: 'zzx@yndxw.com',
    phone: '13900000001',
    avatar: '',
    status: 1,
    memberType: 'svip',
    memberExpireAt: '2025-12-31',
    enterpriseId: null,
    createdAt: '2024-01-01 00:00:00',
    updatedAt: '2024-01-01 00:00:00'
  },
  {
    id: 2,
    username: 'enterprise',
    password: '000003cea478314e',
    role: 'enterprise',
    name: '企业管理员',
    email: 'zzx@yndxw.com',
    phone: '13900000002',
    avatar: '',
    status: 1,
    memberType: 'vip',
    memberExpireAt: '2025-06-30',
    enterpriseId: null,
    createdAt: '2024-01-15 10:00:00',
    updatedAt: '2024-01-15 10:00:00'
  },
  {
    id: 3,
    username: 'teacher',
    password: '000008a02abf7eca',
    role: 'teacher',
    name: '张老师',
    email: 'zzx@yndxw.com',
    phone: '13900000003',
    avatar: '',
    status: 1,
    memberType: 'vip',
    memberExpireAt: '2025-06-30',
    enterpriseId: null,
    createdAt: '2024-02-01 09:00:00',
    updatedAt: '2024-02-01 09:00:00'
  },
  {
    id: 4,
    username: 'student',
    password: '0000012f73ed35ad',
    role: 'student',
    name: '李同学',
    email: 'zzx@yndxw.com',
    phone: '13900000004',
    avatar: '',
    status: 1,
    memberType: 'free',
    memberExpireAt: '',
    enterpriseId: null,
    createdAt: '2024-03-01 08:00:00',
    updatedAt: '2024-03-01 08:00:00'
  }
]

// ============================================================
// 企业数据
// ============================================================

export interface Enterprise {
  id: string
  name: string
  contactPerson: string
  contactPhone: string
  email: string
  address: string
  status: 'pending' | 'verified' | 'rejected'
  createdAt: string
  description?: string
}

export const mockEnterprise: Enterprise[] = [
  {
    id: 'ent_1',
    name: '云南意念科技有限公司',
    contactPerson: '王经理',
    contactPhone: '13800001111',
    email: 'zzx@yndxw.com',
    address: '云南省昆明市',
    status: 'verified',
    createdAt: '2024-01-10 10:00:00',
    description: '一家专注于在线教育和企业培训的技术服务公司'
  }
]

// ============================================================
// 题库数据
// ============================================================

export interface QuestionBank {
  id: number
  name: string
  description: string
  questionCount: number
  createdBy: number
  createdAt: string
  status: 'draft' | 'published'
}

export const mockQuestionBanks: QuestionBank[] = [
  {
    id: 1,
    name: '计算机基础',
    description: '涵盖计算机组成原理、操作系统、网络基础等计算机核心知识',
    questionCount: 4,
    createdBy: 3,
    createdAt: '2024-02-10 10:00:00',
    status: 'published'
  },
  {
    id: 2,
    name: '数学题库',
    description: '包含代数、几何、概率统计等数学基础知识',
    questionCount: 4,
    createdBy: 3,
    createdAt: '2024-02-15 14:00:00',
    status: 'published'
  },
  {
    id: 3,
    name: '英语题库',
    description: '英语词汇、语法、阅读理解等综合英语能力测试',
    questionCount: 4,
    createdBy: 3,
    createdAt: '2024-03-01 09:00:00',
    status: 'published'
  },
  {
    id: 4,
    name: '物理题库',
    description: '力学、电磁学、光学等物理学基础知识',
    questionCount: 4,
    createdBy: 3,
    createdAt: '2024-03-10 11:00:00',
    status: 'published'
  },
  {
    id: 5,
    name: '综合知识',
    description: '涵盖历史、地理、政治等综合学科知识',
    questionCount: 4,
    createdBy: 3,
    createdAt: '2024-03-20 15:00:00',
    status: 'published'
  }
]

// ============================================================
// 题目数据（20道题，每个题库4道，包含单选、多选、判断、填空）
// ============================================================

export const mockQuestions: Question[] = [
  // ---- 计算机基础（题库1）----
  {
    id: 1,
    type: 'single',
    content: '下列哪个是Vue3的核心响应式API？',
    options: ['ref', 'useState', 'createSignal', 'observable'],
    answer: 'A',
    analysis: 'ref是Vue3中最常用的响应式API，用于创建基本类型的响应式数据。',
    score: 5,
    category: '计算机基础',
    difficulty: 2,
    bankId: 1,
    tags: [],
    isFavorite: false,
    wrongCount: 0,
    createdAt: '2024-02-10 10:30:00'
  },
  {
    id: 2,
    type: 'multiple',
    content: '下列哪些是ES6的新特性？',
    options: ['箭头函数', 'Promise', 'var关键字', 'class语法'],
    answer: 'ABD',
    analysis: '箭头函数、Promise和class语法都是ES6引入的，var是ES5就有的。',
    score: 5,
    category: '计算机基础',
    difficulty: 2,
    bankId: 1,
    tags: [],
    isFavorite: false,
    wrongCount: 0,
    createdAt: '2024-02-10 10:35:00'
  },
  {
    id: 3,
    type: 'judge',
    content: 'TCP协议是面向连接的可靠传输协议。',
    options: [],
    answer: '正确',
    analysis: 'TCP（传输控制协议）是面向连接的、可靠的传输层协议，通过三次握手建立连接。',
    score: 3,
    category: '计算机基础',
    difficulty: 1,
    bankId: 1,
    tags: [],
    isFavorite: false,
    wrongCount: 0,
    createdAt: '2024-02-10 10:40:00'
  },
  {
    id: 4,
    type: 'fill',
    content: 'HTTP协议中，状态码______表示"页面未找到"。',
    options: [],
    answer: '404',
    analysis: '404 Not Found 表示服务器无法找到请求的资源。',
    score: 3,
    category: '计算机基础',
    difficulty: 1,
    bankId: 1,
    tags: [],
    isFavorite: false,
    wrongCount: 0,
    createdAt: '2024-02-10 10:45:00'
  },

  // ---- 数学题库（题库2）----
  {
    id: 5,
    type: 'single',
    content: '已知函数f(x) = x² + 2x - 3，则f(2)的值为？',
    options: ['3', '5', '7', '9'],
    answer: 'B',
    analysis: 'f(2) = 2² + 2×2 - 3 = 4 + 4 - 3 = 5。',
    score: 5,
    category: '数学题库',
    difficulty: 1,
    bankId: 2,
    tags: [],
    isFavorite: false,
    wrongCount: 0,
    createdAt: '2024-02-15 14:30:00'
  },
  {
    id: 6,
    type: 'multiple',
    content: '下列哪些数是质数？',
    options: ['2', '9', '11', '15'],
    answer: 'AC',
    analysis: '2和11是质数。9=3×3，15=3×5，都是合数。',
    score: 5,
    category: '数学题库',
    difficulty: 2,
    bankId: 2,
    tags: [],
    isFavorite: false,
    wrongCount: 0,
    createdAt: '2024-02-15 14:35:00'
  },
  {
    id: 7,
    type: 'judge',
    content: '圆的周长公式为 C = 2πr。',
    options: [],
    answer: '正确',
    analysis: '圆的周长 C = 2πr，其中r为半径。',
    score: 3,
    category: '数学题库',
    difficulty: 1,
    bankId: 2,
    tags: [],
    isFavorite: false,
    wrongCount: 0,
    createdAt: '2024-02-15 14:40:00'
  },
  {
    id: 8,
    type: 'fill',
    content: '等差数列 1, 4, 7, 10, ... 的第10项是______。',
    options: [],
    answer: '28',
    analysis: '首项a₁=1，公差d=3，第n项aₙ = a₁ + (n-1)d = 1 + 9×3 = 28。',
    score: 5,
    category: '数学题库',
    difficulty: 2,
    bankId: 2,
    tags: [],
    isFavorite: false,
    wrongCount: 0,
    createdAt: '2024-02-15 14:45:00'
  },

  // ---- 英语题库（题库3）----
  {
    id: 9,
    type: 'single',
    content: 'Choose the correct word: "She ____ to school every day."',
    options: ['go', 'goes', 'going', 'gone'],
    answer: 'B',
    analysis: '主语She是第三人称单数，一般现在时动词需加s/es，go变为goes。',
    score: 5,
    category: '英语题库',
    difficulty: 1,
    bankId: 3,
    tags: [],
    isFavorite: false,
    wrongCount: 0,
    createdAt: '2024-03-01 09:30:00'
  },
  {
    id: 10,
    type: 'multiple',
    content: 'Which of the following are conjunctions?',
    options: ['and', 'beautiful', 'but', 'quickly'],
    answer: 'AC',
    analysis: 'and和but是连词(conjunctions)，beautiful是形容词，quickly是副词。',
    score: 5,
    category: '英语题库',
    difficulty: 2,
    bankId: 3,
    tags: [],
    isFavorite: false,
    wrongCount: 0,
    createdAt: '2024-03-01 09:35:00'
  },
  {
    id: 11,
    type: 'judge',
    content: '"I have been to Beijing" means the speaker is currently in Beijing.',
    options: [],
    answer: '错误',
    analysis: '"have been to"表示曾经去过（已回来），"have gone to"表示已经去了（不在这里）。',
    score: 3,
    category: '英语题库',
    difficulty: 2,
    bankId: 3,
    tags: [],
    isFavorite: false,
    wrongCount: 0,
    createdAt: '2024-03-01 09:40:00'
  },
  {
    id: 12,
    type: 'fill',
    content: 'The past tense of "begin" is ______.',
    options: [],
    answer: 'began',
    analysis: 'begin的过去式是began，过去分词是begun，是不规则动词。',
    score: 3,
    category: '英语题库',
    difficulty: 1,
    bankId: 3,
    tags: [],
    isFavorite: false,
    wrongCount: 0,
    createdAt: '2024-03-01 09:45:00'
  },

  // ---- 物理题库（题库4）----
  {
    id: 13,
    type: 'single',
    content: '光在真空中的传播速度约为多少？',
    options: ['3×10⁶ m/s', '3×10⁸ m/s', '3×10¹⁰ m/s', '3×10⁴ m/s'],
    answer: 'B',
    analysis: '光在真空中的传播速度约为3×10⁸ m/s（即30万千米/秒）。',
    score: 5,
    category: '物理题库',
    difficulty: 1,
    bankId: 4,
    tags: [],
    isFavorite: false,
    wrongCount: 0,
    createdAt: '2024-03-10 11:30:00'
  },
  {
    id: 14,
    type: 'multiple',
    content: '下列哪些属于力的单位？',
    options: ['牛顿(N)', '千克(kg)', '达因(dyn)', '焦耳(J)'],
    answer: 'AC',
    analysis: '牛顿(N)和达因(dyn)是力的单位。千克是质量单位，焦耳是能量单位。',
    score: 5,
    category: '物理题库',
    difficulty: 2,
    bankId: 4,
    tags: [],
    isFavorite: false,
    wrongCount: 0,
    createdAt: '2024-03-10 11:35:00'
  },
  {
    id: 15,
    type: 'judge',
    content: '在地球表面附近，自由落体运动的加速度约为9.8 m/s²。',
    options: [],
    answer: '正确',
    analysis: '地球表面附近的重力加速度g约为9.8 m/s²，通常计算中取10 m/s²。',
    score: 3,
    category: '物理题库',
    difficulty: 1,
    bankId: 4,
    tags: [],
    isFavorite: false,
    wrongCount: 0,
    createdAt: '2024-03-10 11:40:00'
  },
  {
    id: 16,
    type: 'fill',
    content: '欧姆定律的公式为 I = ______，其中U为电压，R为电阻。',
    options: [],
    answer: 'U/R',
    analysis: '欧姆定律：I = U/R，电流等于电压除以电阻。',
    score: 5,
    category: '物理题库',
    difficulty: 1,
    bankId: 4,
    tags: [],
    isFavorite: false,
    wrongCount: 0,
    createdAt: '2024-03-10 11:45:00'
  },

  // ---- 综合知识（题库5）----
  {
    id: 17,
    type: 'single',
    content: '中国的首都是哪座城市？',
    options: ['上海', '北京', '广州', '南京'],
    answer: 'B',
    analysis: '北京是中华人民共和国的首都。',
    score: 5,
    category: '综合知识',
    difficulty: 1,
    bankId: 5,
    tags: [],
    isFavorite: false,
    wrongCount: 0,
    createdAt: '2024-03-20 15:30:00'
  },
  {
    id: 18,
    type: 'multiple',
    content: '下列哪些是中国的四大发明？',
    options: ['造纸术', '火药', '蒸汽机', '印刷术'],
    answer: 'ABD',
    analysis: '中国四大发明：造纸术、印刷术、火药、指南针。蒸汽机是西方发明的。',
    score: 5,
    category: '综合知识',
    difficulty: 1,
    bankId: 5,
    tags: [],
    isFavorite: false,
    wrongCount: 0,
    createdAt: '2024-03-20 15:35:00'
  },
  {
    id: 19,
    type: 'judge',
    content: '地球是太阳系中最大的行星。',
    options: [],
    answer: '错误',
    analysis: '太阳系中最大的行星是木星，地球排第五。',
    score: 3,
    category: '综合知识',
    difficulty: 1,
    bankId: 5,
    tags: [],
    isFavorite: false,
    wrongCount: 0,
    createdAt: '2024-03-20 15:40:00'
  },
  {
    id: 20,
    type: 'fill',
    content: '中国的母亲河是______和长江。',
    options: [],
    answer: '黄河',
    analysis: '黄河和长江被称为中华民族的母亲河。',
    score: 3,
    category: '综合知识',
    difficulty: 1,
    bankId: 5,
    tags: [],
    isFavorite: false,
    wrongCount: 0,
    createdAt: '2024-03-20 15:45:00'
  }
]

// ============================================================
// 试卷数据（5套）
// ============================================================

export interface ExamPaper {
  id: number
  title: string
  description: string
  bankId: number
  bankName: string
  duration: number
  totalScore: number
  passScore: number
  questionIds: number[]
  createdBy: number
  createdAt: string
  status: 'draft' | 'published'
}

export const mockExamPapers: ExamPaper[] = [
  {
    id: 1,
    title: '计算机基础测试',
    description: '测试计算机基础知识，包括编程、网络和操作系统',
    bankId: 1,
    bankName: '计算机基础',
    duration: 60,
    totalScore: 16,
    passScore: 10,
    questionIds: [1, 2, 3, 4],
    createdBy: 3,
    createdAt: '2024-02-20 10:00:00',
    status: 'published'
  },
  {
    id: 2,
    title: '数学能力测验',
    description: '代数、数论等数学基础能力测试',
    bankId: 2,
    bankName: '数学题库',
    duration: 45,
    totalScore: 18,
    passScore: 11,
    questionIds: [5, 6, 7, 8],
    createdBy: 3,
    createdAt: '2024-02-25 14:00:00',
    status: 'published'
  },
  {
    id: 3,
    title: '英语水平测试',
    description: '英语语法和词汇综合测试',
    bankId: 3,
    bankName: '英语题库',
    duration: 40,
    totalScore: 16,
    passScore: 10,
    questionIds: [9, 10, 11, 12],
    createdBy: 3,
    createdAt: '2024-03-05 09:00:00',
    status: 'published'
  },
  {
    id: 4,
    title: '物理基础测验',
    description: '力学、电学等物理基础知识测试',
    bankId: 4,
    bankName: '物理题库',
    duration: 45,
    totalScore: 18,
    passScore: 11,
    questionIds: [13, 14, 15, 16],
    createdBy: 3,
    createdAt: '2024-03-15 11:00:00',
    status: 'published'
  },
  {
    id: 5,
    title: '综合知识竞赛',
    description: '涵盖历史、地理、科学等综合知识',
    bankId: 5,
    bankName: '综合知识',
    duration: 30,
    totalScore: 16,
    passScore: 10,
    questionIds: [17, 18, 19, 20],
    createdBy: 3,
    createdAt: '2024-03-25 15:00:00',
    status: 'draft'
  }
]

// ============================================================
// 课程数据（3个）
// ============================================================

export interface Course {
  id: number
  title: string
  description: string
  cover: string
  teacherId: number
  teacherName: string
  duration: number
  chapterCount: number
  studentCount: number
  price: number
  originalPrice: number
  status: 'draft' | 'published'
  createdAt: string
}

export const mockCourses: Course[] = [
  {
    id: 1,
    title: '计算机基础入门',
    description: '从零开始学习计算机基础知识，包括操作系统、网络、编程入门等内容',
    cover: '',
    teacherId: 3,
    teacherName: '张老师',
    duration: 3600,
    chapterCount: 12,
    studentCount: 128,
    price: 99,
    originalPrice: 199,
    status: 'published',
    createdAt: '2024-02-01 10:00:00'
  },
  {
    id: 2,
    title: '高等数学精讲',
    description: '系统讲解高等数学核心概念，包含微积分、线性代数、概率论',
    cover: '',
    teacherId: 3,
    teacherName: '张老师',
    duration: 5400,
    chapterCount: 20,
    studentCount: 86,
    price: 149,
    originalPrice: 299,
    status: 'published',
    createdAt: '2024-02-20 14:00:00'
  },
  {
    id: 3,
    title: '英语四级冲刺班',
    description: '针对大学英语四级考试的全面辅导课程，涵盖听力、阅读、写作、翻译',
    cover: '',
    teacherId: 3,
    teacherName: '张老师',
    duration: 4800,
    chapterCount: 16,
    studentCount: 215,
    price: 79,
    originalPrice: 159,
    status: 'published',
    createdAt: '2024-03-01 09:00:00'
  }
]

// ============================================================
// 订单数据（3个）
// ============================================================

export interface Order {
  id: number
  orderNo: string
  userId: number
  userName: string
  courseId: number
  courseName: string
  amount: number
  payMethod: 'alipay' | 'wechat' | 'bank'
  status: 'pending' | 'paid' | 'refunded' | 'cancelled'
  createdAt: string
  paidAt?: string
}

export const mockOrders: Order[] = [
  {
    id: 1,
    orderNo: 'ORD2024030100001',
    userId: 4,
    userName: '李同学',
    courseId: 1,
    courseName: '计算机基础入门',
    amount: 99,
    payMethod: 'alipay',
    status: 'paid',
    createdAt: '2024-03-01 10:00:00',
    paidAt: '2024-03-01 10:01:30'
  },
  {
    id: 2,
    orderNo: 'ORD2024031500002',
    userId: 4,
    userName: '李同学',
    courseId: 2,
    courseName: '高等数学精讲',
    amount: 149,
    payMethod: 'wechat',
    status: 'paid',
    createdAt: '2024-03-15 14:00:00',
    paidAt: '2024-03-15 14:02:10'
  },
  {
    id: 3,
    orderNo: 'ORD2024032000003',
    userId: 4,
    userName: '李同学',
    courseId: 3,
    courseName: '英语四级冲刺班',
    amount: 79,
    payMethod: 'alipay',
    status: 'pending',
    createdAt: '2024-03-20 09:00:00'
  }
]

// ============================================================
// 公告数据（3条）
// ============================================================

export interface Notice {
  id: number
  title: string
  content: string
  type: 'system' | 'exam' | 'course'
  createdBy: number
  createdAt: string
  isTop: boolean
}

export const mockNotices: Notice[] = [
  {
    id: 1,
    title: '系统升级通知',
    content: '系统将于2024年4月1日凌晨2:00-4:00进行升级维护，届时系统将暂停服务，请提前做好安排。升级后将新增错题本功能和数据分析模块。',
    type: 'system',
    createdBy: 1,
    createdAt: '2024-03-25 09:00:00',
    isTop: true
  },
  {
    id: 2,
    title: '期中考试安排',
    content: '本学期期中考试将于2024年4月15日至4月20日进行，请各位同学及时查看考试安排并做好复习准备。考试期间请遵守考场纪律。',
    type: 'exam',
    createdBy: 1,
    createdAt: '2024-03-28 10:00:00',
    isTop: true
  },
  {
    id: 3,
    title: '新课程上线通知',
    content: '《英语四级冲刺班》已正式上线，限时优惠价79元（原价159元）。课程包含16个章节，系统讲解四级考试各项技能，欢迎同学们报名学习。',
    type: 'course',
    createdBy: 1,
    createdAt: '2024-03-30 14:00:00',
    isTop: false
  }
]

// ============================================================
// 消息数据（5条）
// ============================================================

export interface Message {
  id: number
  fromUserId: number
  fromUserName: string
  toUserId: number
  toUserName: string
  title: string
  content: string
  isRead: boolean
  createdAt: string
}

export const mockMessages: Message[] = [
  {
    id: 1,
    fromUserId: 1,
    fromUserName: '系统管理员',
    toUserId: 3,
    toUserName: '张老师',
    title: '题库审核通过',
    content: '您提交的"计算机基础"题库已审核通过，现已在系统中发布。感谢您的贡献！',
    isRead: true,
    createdAt: '2024-02-20 11:00:00'
  },
  {
    id: 2,
    fromUserId: 1,
    fromUserName: '系统管理员',
    toUserId: 3,
    toUserName: '张老师',
    title: '新功能上线通知',
    content: '系统已新增批量导入题目功能，您可以在题库管理页面使用Excel批量导入题目。详细使用说明请查看帮助文档。',
    isRead: true,
    createdAt: '2024-03-01 09:00:00'
  },
  {
    id: 3,
    fromUserId: 4,
    fromUserName: '李同学',
    toUserId: 3,
    toUserName: '张老师',
    title: '关于考试时间的问题',
    content: '张老师您好，请问本周五的数学测验是上午还是下午进行？考试范围是全部章节还是只考前三章？',
    isRead: false,
    createdAt: '2024-03-25 16:30:00'
  },
  {
    id: 4,
    fromUserId: 2,
    fromUserName: '企业管理员',
    toUserId: 1,
    toUserName: '系统管理员',
    title: '企业认证申请',
    content: '您好，我们公司（云南意念科技有限公司）已完成企业认证申请，请协助审核。如有需要补充的材料请及时通知。',
    isRead: true,
    createdAt: '2024-01-10 10:30:00'
  },
  {
    id: 5,
    fromUserId: 1,
    fromUserName: '系统管理员',
    toUserId: 4,
    toUserName: '李同学',
    title: '欢迎注册',
    content: '李同学您好，欢迎注册在线考试系统！您可以浏览课程、参加考试，祝您学习愉快。如有任何问题，请随时联系管理员。',
    isRead: true,
    createdAt: '2024-03-01 08:05:00'
  }
]

// ============================================================
// 日志数据（5条）
// ============================================================

export interface SystemLog {
  id: number
  userId: number
  userName: string
  action: string
  module: string
  detail: string
  ip: string
  createdAt: string
}

export const mockLogs: SystemLog[] = [
  {
    id: 1,
    userId: 1,
    userName: '系统管理员',
    action: '用户创建',
    module: '用户管理',
    detail: '创建用户"李同学"(student)',
    ip: '192.168.1.100',
    createdAt: '2024-03-01 08:00:00'
  },
  {
    id: 2,
    userId: 3,
    userName: '张老师',
    action: '题库发布',
    module: '题库管理',
    detail: '发布题库"计算机基础"，包含4道题目',
    ip: '192.168.1.101',
    createdAt: '2024-02-20 10:00:00'
  },
  {
    id: 3,
    userId: 3,
    userName: '张老师',
    action: '试卷创建',
    module: '试卷管理',
    detail: '创建试卷"计算机基础测试"，时长60分钟，总分16分',
    ip: '192.168.1.101',
    createdAt: '2024-02-20 11:00:00'
  },
  {
    id: 4,
    userId: 4,
    userName: '李同学',
    action: '提交考试',
    module: '考试管理',
    detail: '提交试卷"计算机基础测试"，得分12/16',
    ip: '192.168.1.102',
    createdAt: '2024-03-05 11:30:00'
  },
  {
    id: 5,
    userId: 1,
    userName: '系统管理员',
    action: '系统设置修改',
    module: '系统管理',
    detail: '修改系统设置：考试默认时长从60分钟调整为90分钟',
    ip: '192.168.1.100',
    createdAt: '2024-03-20 16:00:00'
  }
]

// ============================================================
// 系统设置
// ============================================================

export interface SystemSettings {
  siteName: string
  logo: string
  defaultExamDuration: number
  maxQuestionPerExam: number
  allowRegister: boolean
  enableEmailNotify: boolean
  examRetryInterval: number
  passScorePercent: number
  uploadMaxSize: number
  maintenanceMode: boolean
}

export const mockSystemSettings: SystemSettings = {
  siteName: '云南意念科技在线考试系统',
  logo: '',
  defaultExamDuration: 90,
  maxQuestionPerExam: 100,
  allowRegister: true,
  enableEmailNotify: true,
  examRetryInterval: 24,
  passScorePercent: 60,
  uploadMaxSize: 10,
  maintenanceMode: false
}

// ============================================================
// 分类数据（兼容旧版）
// ============================================================

export const mockCategories: Category[] = [
  { id: 1, name: '计算机基础', description: '计算机核心知识' },
  { id: 2, name: '数学题库', description: '数学基础知识' },
  { id: 3, name: '英语题库', description: '英语综合能力' },
  { id: 4, name: '物理题库', description: '物理学基础知识' },
  { id: 5, name: '综合知识', description: '综合学科知识' }
]

// ============================================================
// 兼容旧版 Exam 类型（供现有代码使用）
// ============================================================

export const mockExams: Exam[] = mockExamPapers.map(paper => ({
  id: paper.id,
  title: paper.title,
  description: paper.description,
  duration: paper.duration,
  totalScore: paper.totalScore,
  questions: mockQuestions.filter(q => paper.questionIds.includes(q.id)),
  createdAt: paper.createdAt,
  status: paper.status
}))
