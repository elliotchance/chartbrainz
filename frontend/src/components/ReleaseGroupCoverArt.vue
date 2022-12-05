<script setup lang="ts">
const { releaseId, releaseTitle } = defineProps<{
  releaseId: string;
  releaseTitle: string;
}>();
</script>

<template>
  <img
    :src="
      'https://coverartarchive.org/release-group/' + releaseId + '/front-250'
    "
    :alt="releaseTitle"
    width="100"
  />
</template>
