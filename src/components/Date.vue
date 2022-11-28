<script setup lang="ts">
const { year, month, day } = defineProps<{
  year?: number;
  month?: number;
  day?: number;
}>();

function monthName() {
  return [
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
}
</script>

<template>
  {{ day ? parseInt(`${day}`, 10) : "" }} {{ monthName() }} {{ year }}
</template>
