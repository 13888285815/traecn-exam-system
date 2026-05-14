<template>
  <div class="placeholder-page">
    <el-empty description="暂无题库数据">
      <el-button type="primary" @click="$router.push('/question')">浏览题库</el-button>
    </el-empty>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.placeholder-page {
  padding: 40px 0;
}
</style>
