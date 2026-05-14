import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  // GitHub Pages 部署时使用仓库名作为 base 路径
  // 通过 .env.pages 文件中的 VITE_BASE 控制
  const env = loadEnv(mode, process.cwd(), '')
  const base = mode === 'pages' ? '/traecn-exam-system/' : '/'

  return {
    plugins: [vue()],
    base,
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    build: {
      outDir: 'dist',
      assetsInlineLimit: 4096,
      assetsDir: 'assets'
    }
  }
})
