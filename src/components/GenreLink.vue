<script setup lang="ts">
const { genre } = defineProps<{
  genre: string;
}>();

const href = `https://musicbrainz.org/tag/${genre}`;
</script>

<template>
  <a :href="href" target="_blank">{{ genre }}</a>
</template>
