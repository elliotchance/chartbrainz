<script setup lang="ts">
const { title, titleClass, close } = defineProps<{
  title: string;
  titleClass: string;
  close?: () => void;
}>();
</script>

<template>
  <div class="card">
    <div :class="'card-header ' + titleClass">
      {{ title }}
      <button
        type="button"
        class="btn-close float-end"
        aria-label="Close"
        @click="close"
        v-if="close"
      ></button>
    </div>
    <slot></slot>
  </div>
</template>
