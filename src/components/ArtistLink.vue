<script setup lang="ts">
const { name } = defineProps<{
  name: string;
}>();
</script>

<template>
  {{ name }}
</template>
