# 在线考试系统 (Online Exam System)

基于 Vue 3 + TypeScript + Vite + Element Plus 构建的在线考试系统，支持多种题型、实时评分、错题记录等功能。

![在线考试系统](https://img.shields.io/badge/Vue-3.x-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Vite](https://img.shields.io/badge/Vite-5.x-orange)
![Element Plus](https://img.shields.io/badge/Element%20Plus-2.x-purple)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🚀 功能特性

- **多种题型**: 支持单选题、多选题、判断题、填空题、问答题
- **实时评分**: 交卷后即时生成成绩报告，详细展示每道题的答题情况和解析
- **错题记录**: 自动收集错题，支持分类筛选和错题练习，针对性复习提升
- **无尽模式**: 随机题目无限练习
- **管理后台**: 用户管理、题库管理、考试管理、分类管理等功能
- **GitHub Pages 部署**: 支持一键部署到 GitHub Pages

## 🛠️ 技术栈

- Vue 3 + TypeScript
- Vite 5
- Vue Router 4 (Hash 模式)
- Pinia
- Element Plus

## 📦 快速开始

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
npm run dev
```

访问: http://localhost:5173

### 构建生产版本

```bash
# 本地部署构建
npm run build

# GitHub Pages 构建
npm run build:pages
```

### 预览构建结果

```bash
# 本地预览
npm run preview

# GitHub Pages 模式预览
npm run preview:pages
```

## 🔐 测试账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 普通用户 | user1 | user123 |
| 普通用户 | user2 | user123 |

## 🌐 部署到 GitHub Pages

### 自动部署（推荐）

1. 将代码推送到 GitHub 仓库
2. 进入仓库 **Settings** → **Pages**
3. **Source** 选择 **GitHub Actions**
4. 推送代码后，Actions 会自动构建并部署
5. 部署完成后访问 `https://<username>.github.io/<repo-name>/`

### 手动部署

```bash
# 构建
npm run build:pages

# 部署到 gh-pages 分支
git add dist
git commit -m "deploy: build for pages"
git subtree push --prefix dist origin gh-pages
```

## 📁 项目结构

```
├── .github/workflows/deploy.yml  # GitHub Actions 部署配置
├── public/404.html               # GitHub Pages 404 重定向
├── src/
│   ├── api/index.ts              # API 层（localStorage 模拟）
│   ├── data/mockData.ts          # 模拟数据
│   ├── router/index.ts           # 路由配置
│   ├── stores/                   # Pinia 状态管理
│   ├── types/index.ts            # TypeScript 类型定义
│   ├── utils/                    # 工具函数
│   ├── views/                    # 页面组件
│   │   ├── frontend/             # 前台页面
│   │   ├── backend/              # 后台管理
│   │   └── admin/                # 管理员页面
│   ├── App.vue                   # 根组件
│   └── main.ts                   # 入口文件
├── .env.pages                    # GitHub Pages 环境变量
├── index.html                    # HTML 模板
├── vite.config.ts                # Vite 配置
└── package.json                  # 项目配置
```

## 🎯 主要功能模块

### 前台
- 首页展示
- 用户登录/注册
- 题库浏览
- 在线考试
- 错题本
- 个人中心

### 后台管理
- 题库管理（AI导题、智能解析）
- 试卷管理（新增试卷、在线组卷）
- 企业管理（课程、校区、人员）
- 账户管理（订单、发票、订阅）
- 系统设置（权限、备份、接口）
- 数据统计（图表控制台）

## 📝 License

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系

如有问题或建议，请在 GitHub 仓库提交 Issue。
