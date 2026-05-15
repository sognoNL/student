<template>
  <div class="schedule-viewer">
    <!-- <div class="schedule-header">
      <h2>作息时间表</h2>
    </div> -->

    <div class="schedule-container">
      <!-- 冬令时 -->
      <div class="schedule-item">
        <!-- <h3>冬令时</h3> -->
        <div class="schedule-image-frame">
          <img :src="winter" alt="冬令时作息时间表" />
        </div>
      </div>

      <!-- 夏令时 -->
      <div class="schedule-item">
        <!-- <h3>夏令时</h3> -->
        <div class="schedule-image-frame">
          <img :src="summer" alt="夏令时作息时间表" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  winter: String,
  summer: String,
})
</script>