<script setup lang="ts">
const { rating } = defineProps<{
  rating: number;
}>();

function wholeStars() {
  return Math.floor(rating / 20);
}

function halfStar() {
  return rating - Math.floor(rating / 20) * 20 >= 10;
}
</script>

<template>
  <span>
    <span v-if="rating === 0">no rating</span>
    <i class="fa fa-star" v-for="n in wholeStars()"></i>
    <i class="fa fa-star-half-full" v-if="halfStar()"></i>
    <span v-if="rating > 0">&nbsp;({{ (rating / 20).toFixed(1) }})</span>
  </span>
</template>
