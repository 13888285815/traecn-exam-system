<template>
  <div class="not-found">
    <div class="content">
      <h1>404</h1>
      <p>抱歉，您访问的页面不存在</p>
      <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f7fa;
}
.content {
  text-align: center;
}
.content h1 {
  font-size: 120px;
  color: #4A6CF7;
  margin: 0;
}
.content p {
  font-size: 18px;
  color: #666;
  margin: 20px 0 30px;
}
</style>
