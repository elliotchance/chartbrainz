<script setup lang="ts">
const { day, month, year } = defineProps<{
  day?: number;
  month?: number;
  year?: number;
}>();

const monthName = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
][parseInt(`${month}`) - 1];
</script>

<template>
  {{ day ? parseInt(`${day}`, 10) : "" }} {{ monthName }} {{ year }}
</template>
