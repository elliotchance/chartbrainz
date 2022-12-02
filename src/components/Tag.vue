<script setup lang="ts">
const { name, cls, link } = defineProps<{
  name: string;
  cls?: string;
  link?: boolean;
}>();
</script>

<template>
  <a
    :href="link ? 'https://musicbrainz.org/tag/' + name : '#'"
    :target="link ? '_blank' : ''"
    :class="cls"
    >{{ name }}</a
  >
</template>
