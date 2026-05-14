import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// ==================== 前台路由 ====================
const frontendRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/frontend/FrontendLayout.vue'),
    children: [
      { path: '', name: 'HomePage', component: () => import('../views/frontend/Home.vue'), meta: { title: '首页' } },
      { path: 'login', name: 'Login', component: () => import('../views/frontend/Login.vue'), meta: { title: '登录', guest: true } },
      { path: 'register', name: 'Register', component: () => import('../views/frontend/Register.vue'), meta: { title: '注册', guest: true } },
      { path: 'question', name: 'QuestionList', component: () => import('../views/frontend/QuestionList.vue'), meta: { title: '题库列表' } },
      { path: 'question/:id', name: 'QuestionDetail', component: () => import('../views/frontend/QuestionDetail.vue'), meta: { title: '题库详情' } },
      { path: 'question/practice', name: 'QuestionPractice', component: () => import('../views/frontend/QuestionPractice.vue'), meta: { title: '刷题', requiresAuth: true } },
      { path: 'exam', name: 'ExamList', component: () => import('../views/frontend/ExamList.vue'), meta: { title: '考试列表' } },
      { path: 'exam/:id', name: 'ExamDetail', component: () => import('../views/frontend/ExamDetail.vue'), meta: { title: '考试详情' } },
      { path: 'exam/take/:id', name: 'TakeExam', component: () => import('../views/frontend/TakeExam.vue'), meta: { title: '参加考试', requiresAuth: true } },
      { path: 'exam/result/:id', name: 'ExamResult', component: () => import('../views/frontend/ExamResult.vue'), meta: { title: '考试结果', requiresAuth: true } },
      { path: 'exam/endless', name: 'EndlessPractice', component: () => import('../views/frontend/EndlessPractice.vue'), meta: { title: '无尽练习', requiresAuth: true } },
      { path: 'course', name: 'CourseList', component: () => import('../views/frontend/CourseList.vue'), meta: { title: '课程列表' } },
      { path: 'course/:id', name: 'CourseDetail', component: () => import('../views/frontend/CourseDetail.vue'), meta: { title: '课程详情' } },
      { path: 'shop', name: 'Shop', component: () => import('../views/frontend/Shop.vue'), meta: { title: '商城' } },
      {
        path: 'user',
        name: 'UserCenter',
        component: () => import('../views/frontend/UserCenter.vue'),
        meta: { title: '个人中心', requiresAuth: true },
        children: [
          { path: '', name: 'UserDashboard', component: () => import('../views/frontend/user/Dashboard.vue'), meta: { title: '个人中心' } },
          { path: 'profile', name: 'UserProfile', component: () => import('../views/frontend/user/Profile.vue'), meta: { title: '个人信息' } },
          { path: 'orders', name: 'UserOrders', component: () => import('../views/frontend/user/Orders.vue'), meta: { title: '我的订单' } },
          { path: 'banks', name: 'UserBanks', component: () => import('../views/frontend/user/Banks.vue'), meta: { title: '我的题库' } },
          { path: 'wrong', name: 'UserWrong', component: () => import('../views/frontend/user/Wrong.vue'), meta: { title: '我的错题' } },
          { path: 'favorite', name: 'UserFavorite', component: () => import('../views/frontend/user/Favorite.vue'), meta: { title: '我的收藏' } },
          { path: 'records', name: 'UserRecords', component: () => import('../views/frontend/user/Records.vue'), meta: { title: '练习记录' } },
          { path: 'password', name: 'UserPassword', component: () => import('../views/frontend/user/Password.vue'), meta: { title: '修改密码' } }
        ]
      }
    ]
  }
]

// ==================== 后台路由 ====================
const backendRoutes: RouteRecordRaw[] = [
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/backend/BackendLayout.vue'),
    meta: { requiresAuth: true, requiresRole: ['admin', 'enterprise'] as string[] },
    children: [
      // 控制台
      { path: '', name: 'AdminDashboard', component: () => import('../views/backend/Dashboard.vue'), meta: { title: '控制台' } },

      // 题库管理
      { path: 'question/my', name: 'AdminQuestionMy', component: () => import('../views/backend/question/MyBanks.vue'), meta: { title: '我的题库' } },
      { path: 'question/wrong', name: 'AdminQuestionWrong', component: () => import('../views/backend/question/WrongQuestions.vue'), meta: { title: '我的错题' } },
      { path: 'question/favorite', name: 'AdminQuestionFavorite', component: () => import('../views/backend/question/Favorites.vue'), meta: { title: '我的收藏' } },
      { path: 'question/record', name: 'AdminQuestionRecord', component: () => import('../views/backend/question/Records.vue'), meta: { title: '练习记录' } },
      { path: 'question/ai-import', name: 'AdminQuestionAiImport', component: () => import('../views/backend/question/AiImport.vue'), meta: { title: 'AI导题' } },
      { path: 'question/smart-analysis', name: 'AdminQuestionSmartAnalysis', component: () => import('../views/backend/question/SmartAnalysis.vue'), meta: { title: '智能解析' } },

      // 试卷管理
      { path: 'paper/create', name: 'AdminPaperCreate', component: () => import('../views/backend/paper/Create.vue'), meta: { title: '新增试卷' } },
      { path: 'paper/history', name: 'AdminPaperHistory', component: () => import('../views/backend/paper/History.vue'), meta: { title: '考试历史' } },
      { path: 'paper/online', name: 'AdminPaperOnline', component: () => import('../views/backend/paper/Online.vue'), meta: { title: '在线组卷' } },

      // 群组管理
      { path: 'group/created', name: 'AdminGroupCreated', component: () => import('../views/backend/group/Created.vue'), meta: { title: '我创建的群组' } },
      { path: 'group/joined', name: 'AdminGroupJoined', component: () => import('../views/backend/group/Joined.vue'), meta: { title: '我加入的群组' } },

      // 企业管理
      { path: 'enterprise/info', name: 'AdminEnterpriseInfo', component: () => import('../views/backend/enterprise/Info.vue'), meta: { title: '企业介绍' } },
      { path: 'enterprise/cert', name: 'AdminEnterpriseCert', component: () => import('../views/backend/enterprise/Cert.vue'), meta: { title: '企业认证' } },
      { path: 'enterprise/course', name: 'AdminEnterpriseCourse', component: () => import('../views/backend/enterprise/Course.vue'), meta: { title: '课程管理' } },
      { path: 'enterprise/campus', name: 'AdminEnterpriseCampus', component: () => import('../views/backend/enterprise/Campus.vue'), meta: { title: '校区管理' } },
      { path: 'enterprise/teacher', name: 'AdminEnterpriseTeacher', component: () => import('../views/backend/enterprise/Teacher.vue'), meta: { title: '老师管理' } },
      { path: 'enterprise/album', name: 'AdminEnterpriseAlbum', component: () => import('../views/backend/enterprise/Album.vue'), meta: { title: '相册管理' } },
      { path: 'enterprise/page', name: 'AdminEnterprisePage', component: () => import('../views/backend/enterprise/Page.vue'), meta: { title: '自定义页面' } },
      { path: 'enterprise/message', name: 'AdminEnterpriseMessage', component: () => import('../views/backend/enterprise/Message.vue'), meta: { title: '消息中心' } },
      { path: 'enterprise/log', name: 'AdminEnterpriseLog', component: () => import('../views/backend/enterprise/Log.vue'), meta: { title: '学员登录日志' } },
      { path: 'enterprise/operate', name: 'AdminEnterpriseOperate', component: () => import('../views/backend/enterprise/Operate.vue'), meta: { title: '操作日志' } },
      { path: 'enterprise/account', name: 'AdminEnterpriseAccount', component: () => import('../views/backend/enterprise/Account.vue'), meta: { title: '企业账户' } },
      { path: 'enterprise/resource', name: 'AdminEnterpriseResource', component: () => import('../views/backend/enterprise/Resource.vue'), meta: { title: '学习资源' } },
      { path: 'enterprise/task', name: 'AdminEnterpriseTask', component: () => import('../views/backend/enterprise/Task.vue'), meta: { title: '培训任务' } },
      { path: 'enterprise/exam', name: 'AdminEnterpriseExam', component: () => import('../views/backend/enterprise/Exam.vue'), meta: { title: '考试管理' } },
      { path: 'enterprise/staff', name: 'AdminEnterpriseStaff', component: () => import('../views/backend/enterprise/Staff.vue'), meta: { title: '人员管理' } },
      { path: 'enterprise/notice', name: 'AdminEnterpriseNotice', component: () => import('../views/backend/enterprise/Notice.vue'), meta: { title: '公告' } },
      { path: 'enterprise/survey', name: 'AdminEnterpriseSurvey', component: () => import('../views/backend/enterprise/Survey.vue'), meta: { title: '问卷' } },
      { path: 'enterprise/news', name: 'AdminEnterpriseNews', component: () => import('../views/backend/enterprise/News.vue'), meta: { title: '新闻中心' } },

      // 账户管理
      { path: 'account/info', name: 'AdminAccountInfo', component: () => import('../views/backend/account/Info.vue'), meta: { title: '账户信息' } },
      { path: 'account/order', name: 'AdminAccountOrder', component: () => import('../views/backend/account/Order.vue'), meta: { title: '我的订单' } },
      { path: 'account/invoice', name: 'AdminAccountInvoice', component: () => import('../views/backend/account/Invoice.vue'), meta: { title: '我的发票' } },
      { path: 'account/sell', name: 'AdminAccountSell', component: () => import('../views/backend/account/Sell.vue'), meta: { title: '题库出售' } },
      { path: 'account/report', name: 'AdminAccountReport', component: () => import('../views/backend/account/Report.vue'), meta: { title: '试题报错' } },
      { path: 'account/message', name: 'AdminAccountMessage', component: () => import('../views/backend/account/Message.vue'), meta: { title: '消息中心' } },
      { path: 'account/subscribe', name: 'AdminAccountSubscribe', component: () => import('../views/backend/account/Subscribe.vue'), meta: { title: '订阅服务' } },
      { path: 'account/reward', name: 'AdminAccountReward', component: () => import('../views/backend/account/Reward.vue'), meta: { title: '领取奖励' } },
      { path: 'account/download', name: 'AdminAccountDownload', component: () => import('../views/backend/account/Download.vue'), meta: { title: '文档下载' } },
      { path: 'account/recycle', name: 'AdminAccountRecycle', component: () => import('../views/backend/account/Recycle.vue'), meta: { title: '回收站' } },

      // 系统设置
      { path: 'settings/enterprise', name: 'AdminSettingsEnterprise', component: () => import('../views/backend/settings/Enterprise.vue'), meta: { title: '企业设置' } },
      { path: 'settings/member', name: 'AdminSettingsMember', component: () => import('../views/backend/settings/Member.vue'), meta: { title: '会员设置' } },
      { path: 'settings/group', name: 'AdminSettingsGroup', component: () => import('../views/backend/settings/Group.vue'), meta: { title: '群组设置' } },
      { path: 'settings/permission', name: 'AdminSettingsPermission', component: () => import('../views/backend/settings/Permission.vue'), meta: { title: '权限设置' } },
      { path: 'settings/backup', name: 'AdminSettingsBackup', component: () => import('../views/backend/settings/Backup.vue'), meta: { title: '备份和恢复' } },
      { path: 'settings/cache', name: 'AdminSettingsCache', component: () => import('../views/backend/settings/Cache.vue'), meta: { title: '缓存清理' } },
      { path: 'settings/miniapp', name: 'AdminSettingsMiniapp', component: () => import('../views/backend/settings/Miniapp.vue'), meta: { title: '小程序设置' } },
      { path: 'settings/mp', name: 'AdminSettingsMp', component: () => import('../views/backend/settings/Mp.vue'), meta: { title: '公众号设置' } },
      { path: 'settings/api', name: 'AdminSettingsApi', component: () => import('../views/backend/settings/Api.vue'), meta: { title: '接口设置' } },
      { path: 'settings/token', name: 'AdminSettingsToken', component: () => import('../views/backend/settings/Token.vue'), meta: { title: 'Token设置' } },

      // 控制台
      { path: 'control/chart', name: 'AdminControlChart', component: () => import('../views/backend/control/Chart.vue'), meta: { title: '图表控制台' } },
      { path: 'control/warning', name: 'AdminControlWarning', component: () => import('../views/backend/control/Warning.vue'), meta: { title: '预警控制台' } },
      { path: 'control/schedule', name: 'AdminControlSchedule', component: () => import('../views/backend/control/Schedule.vue'), meta: { title: '调度控制' } },
      { path: 'control/security', name: 'AdminControlSecurity', component: () => import('../views/backend/control/Security.vue'), meta: { title: '安全漏洞修复' } },

      // 帮助
      { path: 'help/tutorial', name: 'AdminHelpTutorial', component: () => import('../views/backend/help/Tutorial.vue'), meta: { title: '帮助教程' } },
      { path: 'help/feedback', name: 'AdminHelpFeedback', component: () => import('../views/backend/help/Feedback.vue'), meta: { title: '意见反馈' } },
      { path: 'help/app', name: 'AdminHelpApp', component: () => import('../views/backend/help/App.vue'), meta: { title: 'APP下载' } },
      { path: 'help/version', name: 'AdminHelpVersion', component: () => import('../views/backend/help/Version.vue'), meta: { title: '版本控制' } }
    ]
  }
]

// ==================== 404 兜底 ====================
const fallbackRoute: RouteRecordRaw = {
  path: '/:pathMatch(.*)*',
  name: 'NotFound',
  component: () => import('../views/NotFound.vue'),
  meta: { title: '页面未找到' }
}

// ==================== 路由实例 ====================
const router = createRouter({
  history: createWebHashHistory(),
  routes: [...frontendRoutes, ...backendRoutes, fallbackRoute],
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  }
})

// ==================== 路由守卫 ====================
router.beforeEach((to, _from, next) => {
  // 设置页面标题
  const title = to.meta?.title as string | undefined
  if (title) {
    document.title = `${title} - 题库考试系统`
  } else {
    document.title = '题库考试系统'
  }

  // 获取登录状态和用户角色
  const token = localStorage.getItem('auth_token')
  const isLoggedIn = !!token

  let userRole = ''
  const storedUser = localStorage.getItem('auth_user')
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser)
      userRole = user?.role || ''
    } catch {
      // ignore
    }
  }

  // 需要登录的页面
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  if (requiresAuth && !isLoggedIn) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }

  // 仅游客可访问的页面（如登录、注册）
  const isGuestOnly = to.matched.some(record => record.meta.guest)
  if (isGuestOnly && isLoggedIn) {
    next({ path: '/' })
    return
  }

  // 需要特定角色的页面
  const requiresRole = to.meta.requiresRole as string[] | undefined
  if (requiresRole && requiresRole.length > 0) {
    if (!requiresRole.includes(userRole)) {
      next({ path: '/' })
      return
    }
  }

  next()
})

export default router
