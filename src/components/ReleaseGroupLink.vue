<script setup lang="ts">
const { id, title } = defineProps<{
  id: string;
  title: string;
}>();

const href = `https://musicbrainz.org/release-group/${id}`;
</script>

<template>
  <a :href="href" target="_blank">{{ title }}</a>
</template>
