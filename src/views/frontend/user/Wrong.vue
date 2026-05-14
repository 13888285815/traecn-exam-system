<template>
  <div class="placeholder-page">
    <el-empty description="暂无错题记录">
      <el-button type="primary" @click="$router.push('/question/practice')">去练习</el-button>
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
