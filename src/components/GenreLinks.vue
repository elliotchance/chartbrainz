<script setup lang="ts">
import GenreLink from "./GenreLink.vue";

const { genres } = defineProps<{
  genres: string[];
}>();
</script>

<template>
  <span v-for="(genre, i) in genres">
    {{ i > 0 ? ", " : "" }}<GenreLink :genre="genre" />
  </span>
</template>
