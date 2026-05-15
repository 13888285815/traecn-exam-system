import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // --- state ---
  const sidebarCollapsed = ref<boolean>(localStorage.getItem('sidebar_collapsed') === 'true')
  const currentTheme = ref<string>(localStorage.getItem('app_theme') || 'light')
  const pageTitle = ref<string>('云南意念科技考试系统')

  // --- actions ---

  /**
   * 切换侧边栏折叠状态
   */
  function toggleSidebar(): void {
    sidebarCollapsed.value = !sidebarCollapsed.value
    localStorage.setItem('sidebar_collapsed', String(sidebarCollapsed.value))
  }

  /**
   * 设置主题
   */
  function setTheme(theme: string): void {
    currentTheme.value = theme
    localStorage.setItem('app_theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }

  /**
   * 设置页面标题
   */
  function setPageTitle(title: string): void {
    pageTitle.value = title
    document.title = title ? `${title} - 云南意念科技考试系统` : '云南意念科技考试系统'
  }

  return {
    // state
    sidebarCollapsed,
    currentTheme,
    pageTitle,
    // actions
    toggleSidebar,
    setTheme,
    setPageTitle
  }
})
