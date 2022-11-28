<script setup lang="ts">
const { id, title } = defineProps<{
  id: string;
  title?: string;
}>();

const src = `https://coverartarchive.org/release-group/${id}/front-250`;
</script>

<template>
  <img :src="src" :alt="title" width="100" />
</template>
