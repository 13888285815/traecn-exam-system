import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../types'
import { hashPassword } from '../utils/security'
import { mockUsers } from '../data/mockData'

export const useAuthStore = defineStore('auth', () => {
  // --- state ---
  const token = ref<string>(localStorage.getItem('auth_token') || '')
  const user = ref<User | null>(null)

  // 初始化时从 localStorage 恢复用户信息
  const storedUser = localStorage.getItem('auth_user')
  if (storedUser) {
    try {
      user.value = JSON.parse(storedUser) as User
    } catch {
      localStorage.removeItem('auth_user')
    }
  }

  // --- getters ---
  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const userName = computed(() => user.value?.name || '')
  const userRole = computed(() => user.value?.role || '')
  const isVip = computed(() => user.value?.role === 'enterprise')
  const isEnterprise = computed(() => user.value?.role === 'enterprise')

  // --- actions ---

  /**
   * 登录：从 mockUsers 中查找匹配用户，使用 hashPassword 验证密码
   */
  async function login(username: string, password: string): Promise<{ success: boolean; message: string }> {
    const foundUser = mockUsers.find(u => u.username === username)
    if (!foundUser) {
      return { success: false, message: '用户名不存在' }
    }

    const hashedInput = await hashPassword(password)
    if (hashedInput !== foundUser.password) {
      return { success: false, message: '密码错误' }
    }

    // 生成模拟 token
    const fakeToken = `mock_token_${foundUser.id}_${Date.now()}`
    token.value = fakeToken
    user.value = { ...foundUser }

    // 持久化到 localStorage
    localStorage.setItem('auth_token', fakeToken)
    localStorage.setItem('auth_user', JSON.stringify(foundUser))

    return { success: true, message: '登录成功' }
  }

  /**
   * 注册：模拟注册逻辑
   */
  async function register(data: { username: string; password: string; name: string; email?: string; phone?: string }): Promise<{ success: boolean; message: string }> {
    const exists = mockUsers.find(u => u.username === data.username)
    if (exists) {
      return { success: false, message: '用户名已存在' }
    }

    const hashedPwd = await hashPassword(data.password)
    const newUser: User = {
      id: mockUsers.length + 1,
      username: data.username,
      password: hashedPwd,
      role: 'student',
      name: data.name,
      email: data.email || '',
      phone: data.phone || '',
      avatar: '',
      status: 1,
      memberType: 'free',
      memberExpireAt: '',
      enterpriseId: null,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    }

    // 添加到 mockUsers（仅内存中生效）
    mockUsers.push(newUser)

    // 自动登录
    const fakeToken = `mock_token_${newUser.id}_${Date.now()}`
    token.value = fakeToken
    user.value = { ...newUser }

    localStorage.setItem('auth_token', fakeToken)
    localStorage.setItem('auth_user', JSON.stringify(newUser))

    return { success: true, message: '注册成功' }
  }

  /**
   * 退出登录
   */
  function logout(): void {
    token.value = ''
    user.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  /**
   * 更新个人资料
   */
  function updateProfile(data: Partial<Pick<User, 'name' | 'email' | 'phone'>>): void {
    if (!user.value) return
    user.value = { ...user.value, ...data }
    localStorage.setItem('auth_user', JSON.stringify(user.value))
  }

  /**
   * 修改密码
   */
  async function changePassword(oldPwd: string, newPwd: string): Promise<{ success: boolean; message: string }> {
    if (!user.value) {
      return { success: false, message: '未登录' }
    }

    const hashedOld = await hashPassword(oldPwd)
    if (hashedOld !== user.value.password) {
      return { success: false, message: '原密码错误' }
    }

    const hashedNew = await hashPassword(newPwd)
    user.value.password = hashedNew

    // 同步更新 mockUsers
    const mockUser = mockUsers.find(u => u.id === user.value!.id)
    if (mockUser) {
      mockUser.password = hashedNew
    }

    localStorage.setItem('auth_user', JSON.stringify(user.value))
    return { success: true, message: '密码修改成功' }
  }

  return {
    // state
    token,
    user,
    // getters
    isLoggedIn,
    userName,
    userRole,
    isVip,
    isEnterprise,
    // actions
    login,
    register,
    logout,
    updateProfile,
    changePassword
  }
})
