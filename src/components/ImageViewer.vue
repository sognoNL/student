<template>
  <article class="image-viewer">
    <img :src="src" />
  </article>
</template>

<script setup>
defineProps({
  src: String,
  title: String,
})
</script>