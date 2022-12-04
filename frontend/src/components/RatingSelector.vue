<script setup lang="ts">
import Stars from "./Stars.vue";
import { SubmitRatingFn } from "../types";

const { rating, releaseGroup, submitRating } = defineProps<{
  rating: number;
  releaseGroup: string;
  submitRating: SubmitRatingFn;
}>();
</script>

<template>
  <div class="dropdown">
    <button
      :class="
        'btn btn-' + (rating === 0 ? 'light' : 'secondary') + ' dropdown-toggle'
      "
      type="button"
      data-bs-toggle="dropdown"
      aria-expanded="false"
    >
      <Stars :rating="rating" :key="Math.random()" />
    </button>
    <ul class="dropdown-menu">
      <li v-for="rating in [0, 100, 90, 80, 70, 60, 50, 40, 30, 20, 10]">
        <button
          class="dropdown-item"
          type="button"
          @click="() => submitRating(releaseGroup, rating)"
        >
          <Stars :rating="rating" />
        </button>
      </li>
    </ul>
  </div>
</template>
