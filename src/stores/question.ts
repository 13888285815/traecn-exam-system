import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Question } from '../types'
import { mockQuestions } from '../data/mockData'

export interface QuestionBank {
  id: number
  name: string
  description: string
  questionCount: number
  category: string
  createdAt: string
}

export const useQuestionStore = defineStore('question', () => {
  // --- state ---
  const banks = ref<QuestionBank[]>([
    { id: 1, name: '信息技术题库', description: '包含Vue、JavaScript、CSS等前端知识', questionCount: 5, category: '信息技术', createdAt: '2024-01-01' },
    { id: 2, name: '数学基础题库', description: '代数、几何等数学基础知识', questionCount: 3, category: '数学', createdAt: '2024-01-02' },
    { id: 3, name: '英语水平题库', description: '英语词汇和语法测试', questionCount: 2, category: '英语', createdAt: '2024-01-03' }
  ])
  const questions = ref<Question[]>([])
  const currentBank = ref<QuestionBank | null>(null)
  const wrongQuestions = ref<Question[]>([])
  const favorites = ref<Question[]>([])

  // 初始化时从 localStorage 恢复错题和收藏
  const storedWrong = localStorage.getItem('wrong_questions')
  if (storedWrong) {
    try {
      wrongQuestions.value = JSON.parse(storedWrong) as Question[]
    } catch {
      localStorage.removeItem('wrong_questions')
    }
  }
  const storedFavorites = localStorage.getItem('favorite_questions')
  if (storedFavorites) {
    try {
      favorites.value = JSON.parse(storedFavorites) as Question[]
    } catch {
      localStorage.removeItem('favorite_questions')
    }
  }

  // --- actions ---

  /**
   * 加载题库列表
   */
  function loadBanks(): void {
    // 从 mock 数据中按分类聚合
    const categoryMap = new Map<string, Question[]>()
    for (const q of mockQuestions) {
      const list = categoryMap.get(q.category) || []
      list.push(q)
      categoryMap.set(q.category, list)
    }
    banks.value = Array.from(categoryMap.entries()).map(([category, qs], index) => ({
      id: index + 1,
      name: `${category}题库`,
      description: `包含${qs.length}道${category}相关题目`,
      questionCount: qs.length,
      category,
      createdAt: qs[0]?.createdAt || '2024-01-01'
    }))
  }

  /**
   * 加载指定题库的题目
   */
  function loadQuestions(bankId: number): void {
    const bank = banks.value.find(b => b.id === bankId)
    if (bank) {
      currentBank.value = bank
      questions.value = mockQuestions.filter(q => q.category === bank.category)
    } else {
      currentBank.value = null
      questions.value = []
    }
  }

  /**
   * 添加到错题本
   */
  function addToWrong(question: Question): void {
    const exists = wrongQuestions.value.find(q => q.id === question.id)
    if (!exists) {
      wrongQuestions.value.push(question)
      localStorage.setItem('wrong_questions', JSON.stringify(wrongQuestions.value))
    }
  }

  /**
   * 从错题本移除
   */
  function removeFromWrong(id: number): void {
    wrongQuestions.value = wrongQuestions.value.filter(q => q.id !== id)
    localStorage.setItem('wrong_questions', JSON.stringify(wrongQuestions.value))
  }

  /**
   * 切换收藏状态
   */
  function toggleFavorite(question: Question): void {
    const index = favorites.value.findIndex(q => q.id === question.id)
    if (index >= 0) {
      favorites.value.splice(index, 1)
    } else {
      favorites.value.push(question)
    }
    localStorage.setItem('favorite_questions', JSON.stringify(favorites.value))
  }

  /**
   * 搜索题目（按关键词）
   */
  function searchQuestions(keyword: string): Question[] {
    if (!keyword.trim()) return questions.value
    const lowerKeyword = keyword.toLowerCase()
    return questions.value.filter(q =>
      q.content.toLowerCase().includes(lowerKeyword) ||
      q.category.toLowerCase().includes(lowerKeyword) ||
      q.analysis?.toLowerCase().includes(lowerKeyword)
    )
  }

  return {
    // state
    banks,
    questions,
    currentBank,
    wrongQuestions,
    favorites,
    // actions
    loadBanks,
    loadQuestions,
    addToWrong,
    removeFromWrong,
    toggleFavorite,
    searchQuestions
  }
})
