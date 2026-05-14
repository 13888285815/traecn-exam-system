import type {
  User, Question, Exam, UserAnswer, ExamRecord,
  WrongQuestion, Category, RecycleItem,
  WrongQuestionRecycleItem, ExamSession, ExamTimeSlot, ErrorAnalysis
} from '../types'
import { mockUsers, mockQuestions, mockExams, mockCategories } from '../data/mockData'
import { secureStorage, hashPassword, verifyPassword } from '../utils/security'

// ============ Storage Keys ============
const STORAGE_KEYS = {
  USERS: 'exam_users',
  QUESTIONS: 'exam_questions',
  EXAMS: 'exam_exams',
  EXAM_RECORDS: 'exam_records',
  WRONG_QUESTIONS: 'exam_wrong_questions',
  WRONG_QUESTION_RECYCLE: 'exam_wrong_question_recycle',
  CATEGORIES: 'exam_categories',
  RECYCLE_BIN: 'exam_recycle_bin',
  EXAM_SESSIONS: 'exam_sessions',
  TIME_SLOTS: 'exam_time_slots',
  ERROR_ANALYSIS: 'exam_error_analysis',
  CURRENT_USER: 'user',
  INITIALIZED: 'exam_initialized'
}

// ============ Initialize Data ============
function initializeData(): void {
  const initialized = secureStorage.getItem<boolean>(STORAGE_KEYS.INITIALIZED)
  if (!initialized) {
    secureStorage.setItem(STORAGE_KEYS.USERS, mockUsers)
    secureStorage.setItem(STORAGE_KEYS.QUESTIONS, mockQuestions)
    secureStorage.setItem(STORAGE_KEYS.EXAMS, mockExams)
    secureStorage.setItem(STORAGE_KEYS.CATEGORIES, mockCategories)
    secureStorage.setItem(STORAGE_KEYS.EXAM_RECORDS, [])
    secureStorage.setItem(STORAGE_KEYS.WRONG_QUESTIONS, [])
    secureStorage.setItem(STORAGE_KEYS.WRONG_QUESTION_RECYCLE, [])
    secureStorage.setItem(STORAGE_KEYS.RECYCLE_BIN, [])
    secureStorage.setItem(STORAGE_KEYS.EXAM_SESSIONS, [])
    secureStorage.setItem(STORAGE_KEYS.TIME_SLOTS, [])
    secureStorage.setItem(STORAGE_KEYS.ERROR_ANALYSIS, [])
    secureStorage.setItem(STORAGE_KEYS.INITIALIZED, true)
  }
}

initializeData()

// ============ Helper Functions ============
function getData<T>(key: string): T[] {
  return secureStorage.getItem<T[]>(key) || []
}

function setData<T>(key: string, data: T[]): void {
  secureStorage.setItem(key, data)
}

function generateId(items: { id: number }[]): number {
  if (items.length === 0) return 1
  return Math.max(...items.map(item => item.id)) + 1
}

function getCurrentUser(): User | null {
  return secureStorage.getItem<User>(STORAGE_KEYS.CURRENT_USER)
}

// ============ User API ============
export const userApi = {
  async login(username: string, password: string): Promise<User> {
    const users = getData<User>(STORAGE_KEYS.USERS)
    const hashedPassword = await hashPassword(password)
    const user = users.find(u => u.username === username && u.password === hashedPassword)
    if (!user) {
      throw new Error('用户名或密码错误')
    }
    secureStorage.setItem(STORAGE_KEYS.CURRENT_USER, user)
    return user
  },

  logout(): void {
    secureStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
  },

  getAllUsers(): User[] {
    return getData<User>(STORAGE_KEYS.USERS)
  },

  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const users = getData<User>(STORAGE_KEYS.USERS)
    const exists = users.find(u => u.username === userData.username)
    if (exists) {
      throw new Error('用户名已存在')
    }
    const hashedPassword = await hashPassword(userData.password)
    const newUser: User = {
      ...userData,
      id: generateId(users),
      password: hashedPassword,
      createdAt: new Date().toISOString().split('T')[0]
    }
    users.push(newUser)
    setData(STORAGE_KEYS.USERS, users)
    return newUser
  },

  async updateUser(id: number, userData: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User> {
    const users = getData<User>(STORAGE_KEYS.USERS)
    const index = users.findIndex(u => u.id === id)
    if (index === -1) {
      throw new Error('用户不存在')
    }
    if (userData.password) {
      userData.password = await hashPassword(userData.password)
    }
    users[index] = { ...users[index], ...userData }
    setData(STORAGE_KEYS.USERS, users)
    // Update current user if editing self
    const currentUser = getCurrentUser()
    if (currentUser && currentUser.id === id) {
      secureStorage.setItem(STORAGE_KEYS.CURRENT_USER, users[index])
    }
    return users[index]
  },

  deleteUser(id: number): void {
    const users = getData<User>(STORAGE_KEYS.USERS)
    const filtered = users.filter(u => u.id !== id)
    if (filtered.length === users.length) {
      throw new Error('用户不存在')
    }
    setData(STORAGE_KEYS.USERS, filtered)
  }
}

// ============ Question API ============
export const questionApi = {
  getAllQuestions(): Question[] {
    return getData<Question>(STORAGE_KEYS.QUESTIONS)
  },

  createQuestion(questionData: Omit<Question, 'id' | 'createdAt'>): Question {
    const questions = getData<Question>(STORAGE_KEYS.QUESTIONS)
    const newQuestion: Question = {
      ...questionData,
      id: generateId(questions),
      createdAt: new Date().toISOString().split('T')[0]
    }
    questions.push(newQuestion)
    setData(STORAGE_KEYS.QUESTIONS, questions)
    return newQuestion
  },

  updateQuestion(id: number, questionData: Partial<Omit<Question, 'id' | 'createdAt'>>): Question {
    const questions = getData<Question>(STORAGE_KEYS.QUESTIONS)
    const index = questions.findIndex(q => q.id === id)
    if (index === -1) {
      throw new Error('题目不存在')
    }
    questions[index] = { ...questions[index], ...questionData }
    setData(STORAGE_KEYS.QUESTIONS, questions)
    return questions[index]
  },

  deleteQuestion(id: number): void {
    const questions = getData<Question>(STORAGE_KEYS.QUESTIONS)
    const filtered = questions.filter(q => q.id !== id)
    if (filtered.length === questions.length) {
      throw new Error('题目不存在')
    }
    setData(STORAGE_KEYS.QUESTIONS, filtered)
  },

  batchDeleteQuestions(ids: number[]): void {
    const questions = getData<Question>(STORAGE_KEYS.QUESTIONS)
    const filtered = questions.filter(q => !ids.includes(q.id))
    setData(STORAGE_KEYS.QUESTIONS, filtered)
  }
}

// ============ Exam API ============
export const examApi = {
  getAllExams(): Exam[] {
    return getData<Exam>(STORAGE_KEYS.EXAMS)
  },

  getExamById(id: number): Exam | undefined {
    const exams = getData<Exam>(STORAGE_KEYS.EXAMS)
    return exams.find(e => e.id === id)
  },

  createExam(examData: Omit<Exam, 'id' | 'createdAt'>): Exam {
    const exams = getData<Exam>(STORAGE_KEYS.EXAMS)
    const newExam: Exam = {
      ...examData,
      id: generateId(exams),
      createdAt: new Date().toISOString().split('T')[0]
    }
    exams.push(newExam)
    setData(STORAGE_KEYS.EXAMS, exams)
    return newExam
  },

  updateExam(id: number, examData: Partial<Omit<Exam, 'id' | 'createdAt'>>): Exam {
    const exams = getData<Exam>(STORAGE_KEYS.EXAMS)
    const index = exams.findIndex(e => e.id === id)
    if (index === -1) {
      throw new Error('试卷不存在')
    }
    exams[index] = { ...exams[index], ...examData }
    setData(STORAGE_KEYS.EXAMS, exams)
    return exams[index]
  },

  deleteExam(id: number): void {
    const exams = getData<Exam>(STORAGE_KEYS.EXAMS)
    const filtered = exams.filter(e => e.id !== id)
    if (filtered.length === exams.length) {
      throw new Error('试卷不存在')
    }
    setData(STORAGE_KEYS.EXAMS, filtered)
  },

  submitExam(userId: number, examId: number, answers: { questionId: number; answer: string; timeSpent: number }[]): ExamRecord {
    const exams = getData<Exam>(STORAGE_KEYS.EXAMS)
    const exam = exams.find(e => e.id === examId)
    if (!exam) {
      throw new Error('试卷不存在')
    }

    const questions = exam.questions
    let totalScore = 0
    let earnedScore = 0
    const userAnswers: UserAnswer[] = []

    for (const question of questions) {
      totalScore += question.score
      const submittedAnswer = answers.find(a => a.questionId === question.id)
      const userAnswer = submittedAnswer ? submittedAnswer.answer : ''
      const timeSpent = submittedAnswer ? submittedAnswer.timeSpent : 0
      const isCorrect = checkAnswer(question, userAnswer)

      if (isCorrect) {
        earnedScore += question.score
      }

      userAnswers.push({
        id: generateId(userAnswers),
        userId,
        examId,
        questionId: question.id,
        answer: userAnswer,
        isCorrect,
        timeSpent
      })

      // Update wrong questions
      if (!isCorrect && userAnswer) {
        updateWrongQuestion(userId, question, userAnswer)
      } else if (isCorrect) {
        removeCorrectWrongQuestion(userId, question.id)
      }
    }

    const records = getData<ExamRecord>(STORAGE_KEYS.EXAM_RECORDS)
    const record: ExamRecord = {
      id: generateId(records),
      paperId: examId,
      userId,
      examId,
      score: earnedScore,
      totalScore,
      answers: userAnswers,
      status: 'completed',
      startTime: new Date(Date.now() - (exam.duration * 60 * 1000)).toISOString(),
      endTime: new Date().toISOString(),
      duration: exam.duration,
      createdAt: new Date().toISOString()
    }
    records.push(record)
    setData(STORAGE_KEYS.EXAM_RECORDS, records)

    // Update error analysis
    updateErrorAnalysis(userId, exam, userAnswers, questions)

    return record
  }
}

// ============ Answer Checking Logic ============
function checkAnswer(question: Question, userAnswer: string): boolean {
  if (!userAnswer || userAnswer.trim() === '') return false

  switch (question.type) {
    case 'single':
      // Exact match for single choice
      return userAnswer.trim().toUpperCase() === question.answer.trim().toUpperCase()

    case 'multiple':
      // Sort and compare for multiple choice
      const userSorted = userAnswer.trim().toUpperCase().split('').sort().join('')
      const correctSorted = question.answer.trim().toUpperCase().split('').sort().join('')
      return userSorted === correctSorted

    case 'judge':
      // Normalize judge answers
      const normalizedUser = normalizeJudgeAnswer(userAnswer)
      const normalizedCorrect = normalizeJudgeAnswer(question.answer)
      return normalizedUser === normalizedCorrect

    case 'fill':
      // Case-insensitive comparison for fill-in-the-blank
      return userAnswer.trim().toLowerCase() === question.answer.trim().toLowerCase()

    case 'essay':
      // Keyword matching with 60% threshold for essay questions
      return checkEssayAnswer(userAnswer, question.answer)

    default:
      return false
  }
}

function normalizeJudgeAnswer(answer: string): string {
  const normalized = answer.trim().toLowerCase()
  if (normalized === 'true' || normalized === '对' || normalized === '正确' || normalized === 'yes' || normalized === '是') {
    return '正确'
  }
  if (normalized === 'false' || normalized === '错' || normalized === '错误' || normalized === 'no' || normalized === '否') {
    return '错误'
  }
  return normalized
}

function checkEssayAnswer(userAnswer: string, correctAnswer: string): boolean {
  if (!userAnswer.trim()) return false

  // Split correct answer into keywords (by comma, space, or Chinese comma)
  const keywords = correctAnswer
    .split(/[,，、\s;；]+/)
    .map(k => k.trim())
    .filter(k => k.length > 0)

  if (keywords.length === 0) return false

  // Count how many keywords appear in the user's answer
  const matchedKeywords = keywords.filter(keyword => {
    return userAnswer.toLowerCase().includes(keyword.toLowerCase())
  })

  // At least 60% of keywords must be matched
  const matchRate = matchedKeywords.length / keywords.length
  return matchRate >= 0.6
}

// ============ Wrong Question Helpers ============
function updateWrongQuestion(userId: number, question: Question, userAnswer: string): void {
  const wrongQuestions = getData<WrongQuestion>(STORAGE_KEYS.WRONG_QUESTIONS)
  const existing = wrongQuestions.find(
    wq => wq.userId === userId && wq.questionId === question.id
  )

  if (existing) {
    existing.wrongCount++
    existing.userAnswer = userAnswer
    existing.lastWrongTime = new Date().toISOString()
  } else {
    wrongQuestions.push({
      id: generateId(wrongQuestions),
      userId,
      questionId: question.id,
      question,
      userAnswer,
      wrongCount: 1,
      lastWrongTime: new Date().toISOString()
    })
  }

  setData(STORAGE_KEYS.WRONG_QUESTIONS, wrongQuestions)
}

function removeCorrectWrongQuestion(userId: number, questionId: number): void {
  const wrongQuestions = getData<WrongQuestion>(STORAGE_KEYS.WRONG_QUESTIONS)
  const filtered = wrongQuestions.filter(
    wq => !(wq.userId === userId && wq.questionId === questionId)
  )
  setData(STORAGE_KEYS.WRONG_QUESTIONS, filtered)
}

// ============ Error Analysis Helper ============
function updateErrorAnalysis(
  userId: number,
  exam: Exam,
  userAnswers: UserAnswer[],
  questions: Question[]
): void {
  const analyses = getData<ErrorAnalysis>(STORAGE_KEYS.ERROR_ANALYSIS)

  for (const answer of userAnswers) {
    if (answer.isCorrect) continue

    const question = questions.find(q => q.id === answer.questionId)
    if (!question) continue

    const existing = analyses.find(
      a => a.questionId === question.id && a.userId === userId
    )

    if (existing) {
      existing.wrongCount++
      if (!existing.commonErrors.includes(answer.answer)) {
        existing.commonErrors.push(answer.answer)
      }
    } else {
      analyses.push({
        questionId: question.id,
        userId,
        userAnswer: answer.answer,
        correctAnswer: question.answer,
        wrongCount: 1,
        commonErrors: [answer.answer],
        suggestedReview: question.analysis || '请复习相关知识点'
      })
    }
  }

  setData(STORAGE_KEYS.ERROR_ANALYSIS, analyses)
}

// ============ Wrong Question API ============
export const wrongQuestionApi = {
  getWrongQuestionsByUserId(userId: number): WrongQuestion[] {
    const wrongQuestions = getData<WrongQuestion>(STORAGE_KEYS.WRONG_QUESTIONS)
    return wrongQuestions.filter(wq => wq.userId === userId)
  },

  removeWrongQuestion(userId: number, questionId: number): void {
    const wrongQuestions = getData<WrongQuestion>(STORAGE_KEYS.WRONG_QUESTIONS)
    const target = wrongQuestions.find(
      wq => wq.userId === userId && wq.questionId === questionId
    )
    if (!target) {
      throw new Error('错题不存在')
    }
    // Move to recycle bin
    const recycleItems = getData<WrongQuestionRecycleItem>(STORAGE_KEYS.WRONG_QUESTION_RECYCLE)
    recycleItems.push({
      id: generateId(recycleItems),
      userId: target.userId,
      questionId: target.questionId,
      question: target.question,
      userAnswer: target.userAnswer,
      wrongCount: target.wrongCount,
      lastWrongTime: target.lastWrongTime,
      deletedAt: new Date().toISOString()
    })
    setData(STORAGE_KEYS.WRONG_QUESTION_RECYCLE, recycleItems)

    // Remove from wrong questions
    const filtered = wrongQuestions.filter(
      wq => !(wq.userId === userId && wq.questionId === questionId)
    )
    setData(STORAGE_KEYS.WRONG_QUESTIONS, filtered)
  },

  clearAllWrongQuestions(userId: number): void {
    const wrongQuestions = getData<WrongQuestion>(STORAGE_KEYS.WRONG_QUESTIONS)
    const userWrongQuestions = wrongQuestions.filter(wq => wq.userId === userId)
    const recycleItems = getData<WrongQuestionRecycleItem>(STORAGE_KEYS.WRONG_QUESTION_RECYCLE)

    for (const wq of userWrongQuestions) {
      recycleItems.push({
        id: generateId(recycleItems),
        userId: wq.userId,
        questionId: wq.questionId,
        question: wq.question,
        userAnswer: wq.userAnswer,
        wrongCount: wq.wrongCount,
        lastWrongTime: wq.lastWrongTime,
        deletedAt: new Date().toISOString()
      })
    }

    setData(STORAGE_KEYS.WRONG_QUESTION_RECYCLE, recycleItems)
    const remaining = wrongQuestions.filter(wq => wq.userId !== userId)
    setData(STORAGE_KEYS.WRONG_QUESTIONS, remaining)
  },

  getRecycleBin(userId: number): WrongQuestionRecycleItem[] {
    const recycleItems = getData<WrongQuestionRecycleItem>(STORAGE_KEYS.WRONG_QUESTION_RECYCLE)
    return recycleItems.filter(item => item.userId === userId)
  },

  restoreFromRecycleBin(userId: number, questionId: number): void {
    const recycleItems = getData<WrongQuestionRecycleItem>(STORAGE_KEYS.WRONG_QUESTION_RECYCLE)
    const target = recycleItems.find(
      item => item.userId === userId && item.questionId === questionId
    )
    if (!target) {
      throw new Error('回收站中不存在该错题')
    }

    // Restore to wrong questions
    const wrongQuestions = getData<WrongQuestion>(STORAGE_KEYS.WRONG_QUESTIONS)
    const alreadyExists = wrongQuestions.find(
      wq => wq.userId === userId && wq.questionId === questionId
    )
    if (!alreadyExists) {
      wrongQuestions.push({
        id: generateId(wrongQuestions),
        userId: target.userId,
        questionId: target.questionId,
        question: target.question,
        userAnswer: target.userAnswer,
        wrongCount: target.wrongCount,
        lastWrongTime: target.lastWrongTime
      })
      setData(STORAGE_KEYS.WRONG_QUESTIONS, wrongQuestions)
    }

    // Remove from recycle bin
    const filtered = recycleItems.filter(
      item => !(item.userId === userId && item.questionId === questionId)
    )
    setData(STORAGE_KEYS.WRONG_QUESTION_RECYCLE, filtered)
  },

  deleteFromRecycleBin(userId: number, questionId: number): void {
    const recycleItems = getData<WrongQuestionRecycleItem>(STORAGE_KEYS.WRONG_QUESTION_RECYCLE)
    const filtered = recycleItems.filter(
      item => !(item.userId === userId && item.questionId === questionId)
    )
    setData(STORAGE_KEYS.WRONG_QUESTION_RECYCLE, filtered)
  },

  async verifyUserPassword(userId: number, password: string): Promise<boolean> {
    const users = getData<User>(STORAGE_KEYS.USERS)
    const user = users.find(u => u.id === userId)
    if (!user) {
      throw new Error('用户不存在')
    }
    return verifyPassword(password, user.password)
  }
}

// ============ Exam Session API ============
export const examSessionApi = {
  createSession(userId: number, examId: number, questions: Question[], mode: 'normal' | 'endless' = 'normal'): ExamSession {
    const sessions = getData<ExamSession>(STORAGE_KEYS.EXAM_SESSIONS)
    const session: ExamSession = {
      id: generateId(sessions),
      userId,
      examId,
      questions,
      currentIndex: 0,
      answers: [],
      startTime: new Date().toISOString(),
      mode,
      status: 'in_progress'
    }
    sessions.push(session)
    setData(STORAGE_KEYS.EXAM_SESSIONS, sessions)
    return session
  },

  submitAnswer(sessionId: number, questionId: number, answer: string, timeSpent: number): ExamSession {
    const sessions = getData<ExamSession>(STORAGE_KEYS.EXAM_SESSIONS)
    const session = sessions.find(s => s.id === sessionId)
    if (!session) {
      throw new Error('考试会话不存在')
    }

    const existingAnswer = session.answers.find(a => a.questionId === questionId)
    if (existingAnswer) {
      existingAnswer.answer = answer
      existingAnswer.timeSpent = timeSpent
    } else {
      session.answers.push({ questionId, answer, timeSpent })
    }

    setData(STORAGE_KEYS.EXAM_SESSIONS, sessions)
    return session
  },

  exitSession(sessionId: number): void {
    const sessions = getData<ExamSession>(STORAGE_KEYS.EXAM_SESSIONS)
    const session = sessions.find(s => s.id === sessionId)
    if (!session) {
      throw new Error('考试会话不存在')
    }
    session.status = 'exited'
    session.endTime = new Date().toISOString()
    setData(STORAGE_KEYS.EXAM_SESSIONS, sessions)
  },

  getSession(sessionId: number): ExamSession | undefined {
    const sessions = getData<ExamSession>(STORAGE_KEYS.EXAM_SESSIONS)
    return sessions.find(s => s.id === sessionId)
  },

  updateSessionIndex(sessionId: number, index: number): ExamSession {
    const sessions = getData<ExamSession>(STORAGE_KEYS.EXAM_SESSIONS)
    const session = sessions.find(s => s.id === sessionId)
    if (!session) {
      throw new Error('考试会话不存在')
    }
    session.currentIndex = index
    setData(STORAGE_KEYS.EXAM_SESSIONS, sessions)
    return session
  }
}

// ============ Exam Record API ============
export const examRecordApi = {
  getLatestRecordByUserAndExam(userId: number, examId: number): ExamRecord | undefined {
    const records = getData<ExamRecord>(STORAGE_KEYS.EXAM_RECORDS)
    const examRecords = records
      .filter(r => r.userId === userId && r.examId === examId)
      .sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime())
    return examRecords[0]
  },

  getAllRecords(): ExamRecord[] {
    return getData<ExamRecord>(STORAGE_KEYS.EXAM_RECORDS)
  },

  getRecordsByUserId(userId: number): ExamRecord[] {
    return getData<ExamRecord>(STORAGE_KEYS.EXAM_RECORDS).filter(r => r.userId === userId)
  },

  getRecordById(id: number): ExamRecord | undefined {
    return getData<ExamRecord>(STORAGE_KEYS.EXAM_RECORDS).find(r => r.id === id)
  }
}

// ============ Category API ============
export const categoryApi = {
  getAllCategories(): Category[] {
    return getData<Category>(STORAGE_KEYS.CATEGORIES)
  },

  createCategory(categoryData: Omit<Category, 'id'>): Category {
    const categories = getData<Category>(STORAGE_KEYS.CATEGORIES)
    const newCategory: Category = {
      ...categoryData,
      id: generateId(categories)
    }
    categories.push(newCategory)
    setData(STORAGE_KEYS.CATEGORIES, categories)
    return newCategory
  },

  updateCategory(id: number, categoryData: Partial<Omit<Category, 'id'>>): Category {
    const categories = getData<Category>(STORAGE_KEYS.CATEGORIES)
    const index = categories.findIndex(c => c.id === id)
    if (index === -1) {
      throw new Error('分类不存在')
    }
    categories[index] = { ...categories[index], ...categoryData }
    setData(STORAGE_KEYS.CATEGORIES, categories)
    return categories[index]
  },

  deleteCategory(id: number): void {
    const categories = getData<Category>(STORAGE_KEYS.CATEGORIES)
    const filtered = categories.filter(c => c.id !== id)
    if (filtered.length === categories.length) {
      throw new Error('分类不存在')
    }
    setData(STORAGE_KEYS.CATEGORIES, filtered)
  }
}

// ============ Recycle Bin API ============
export const recycleBinApi = {
  getAll(): RecycleItem[] {
    return getData<RecycleItem>(STORAGE_KEYS.RECYCLE_BIN)
  },

  restore(id: number): void {
    const items = getData<RecycleItem>(STORAGE_KEYS.RECYCLE_BIN)
    const item = items.find(i => i.id === id)
    if (!item) {
      throw new Error('回收站中不存在该条目')
    }

    // Restore based on type
    switch (item.type) {
      case 'question': {
        const questions = getData<Question>(STORAGE_KEYS.QUESTIONS)
        const exists = questions.find(q => q.id === (item.data as Question).id)
        if (!exists) {
          questions.push(item.data as Question)
          setData(STORAGE_KEYS.QUESTIONS, questions)
        }
        break
      }
      case 'exam': {
        const exams = getData<Exam>(STORAGE_KEYS.EXAMS)
        const exists = exams.find(e => e.id === (item.data as Exam).id)
        if (!exists) {
          exams.push(item.data as Exam)
          setData(STORAGE_KEYS.EXAMS, exams)
        }
        break
      }
      default:
        break
    }

    // Remove from recycle bin
    const filtered = items.filter(i => i.id !== id)
    setData(STORAGE_KEYS.RECYCLE_BIN, filtered)
  },

  delete(id: number): void {
    const items = getData<RecycleItem>(STORAGE_KEYS.RECYCLE_BIN)
    const filtered = items.filter(i => i.id !== id)
    if (filtered.length === items.length) {
      throw new Error('回收站中不存在该条目')
    }
    setData(STORAGE_KEYS.RECYCLE_BIN, filtered)
  },

  clear(): void {
    setData(STORAGE_KEYS.RECYCLE_BIN, [])
  }
}

// ============ Data Clean API ============
export const dataCleanApi = {
  cleanAll(): void {
    // Reset all data to initial state
    secureStorage.setItem(STORAGE_KEYS.USERS, mockUsers)
    secureStorage.setItem(STORAGE_KEYS.QUESTIONS, mockQuestions)
    secureStorage.setItem(STORAGE_KEYS.EXAMS, mockExams)
    secureStorage.setItem(STORAGE_KEYS.CATEGORIES, mockCategories)
    secureStorage.setItem(STORAGE_KEYS.EXAM_RECORDS, [])
    secureStorage.setItem(STORAGE_KEYS.WRONG_QUESTIONS, [])
    secureStorage.setItem(STORAGE_KEYS.WRONG_QUESTION_RECYCLE, [])
    secureStorage.setItem(STORAGE_KEYS.RECYCLE_BIN, [])
    secureStorage.setItem(STORAGE_KEYS.EXAM_SESSIONS, [])
    secureStorage.setItem(STORAGE_KEYS.TIME_SLOTS, [])
    secureStorage.setItem(STORAGE_KEYS.ERROR_ANALYSIS, [])
  }
}

// ============ Time Slot API ============
export const timeSlotApi = {
  getAll(): ExamTimeSlot[] {
    return getData<ExamTimeSlot>(STORAGE_KEYS.TIME_SLOTS)
  },

  create(slotData: Omit<ExamTimeSlot, 'id'>): ExamTimeSlot {
    const slots = getData<ExamTimeSlot>(STORAGE_KEYS.TIME_SLOTS)
    const newSlot: ExamTimeSlot = {
      ...slotData,
      id: generateId(slots)
    }
    slots.push(newSlot)
    setData(STORAGE_KEYS.TIME_SLOTS, slots)
    return newSlot
  },

  update(id: number, slotData: Partial<Omit<ExamTimeSlot, 'id'>>): ExamTimeSlot {
    const slots = getData<ExamTimeSlot>(STORAGE_KEYS.TIME_SLOTS)
    const index = slots.findIndex(s => s.id === id)
    if (index === -1) {
      throw new Error('考试时段不存在')
    }
    slots[index] = { ...slots[index], ...slotData }
    setData(STORAGE_KEYS.TIME_SLOTS, slots)
    return slots[index]
  },

  delete(id: number): void {
    const slots = getData<ExamTimeSlot>(STORAGE_KEYS.TIME_SLOTS)
    const filtered = slots.filter(s => s.id !== id)
    if (filtered.length === slots.length) {
      throw new Error('考试时段不存在')
    }
    setData(STORAGE_KEYS.TIME_SLOTS, filtered)
  }
}

// ============ Error Analysis API ============
export const errorAnalysisApi = {
  getAnalysis(userId?: number): ErrorAnalysis[] {
    const analyses = getData<ErrorAnalysis>(STORAGE_KEYS.ERROR_ANALYSIS)
    if (userId) {
      return analyses.filter(a => a.userId === userId)
    }
    return analyses
  }
}
