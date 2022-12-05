<script setup lang="ts">
const { name, disambiguation } = defineProps<{
  name: string;
  disambiguation?: string;
}>();
</script>

<template>
  <span>
    {{ name }}
    <span v-if="disambiguation" class="text-muted">({{ disambiguation }})</span>
  </span>
</template>
