<script setup lang="ts">
import { ReleaseType } from "../types";
import { ref } from "vue";

const { decade, setDecade, releases } = defineProps<{
  decade: string;
  setDecade: (decade: string) => void;
  releases: ReleaseType[];
}>();
</script>

<script lang="ts"></script>

<template>
  <ul class="nav nav-pills">
    <li class="nav-item">
      <a
        :class="'nav-link ' + (decade === '' ? 'active' : '')"
        href="#"
        @click="() => setDecade('')"
        >All-time</a
      >
    </li>

    <li
      class="nav-item"
      v-for="d in Array.from(new Set(
        releases.map(
            (r: ReleaseType) => (r.releaseYear || 0) - ((r.releaseYear || 0) % 10)
        )
        ))
            .sort()
            .reverse()
            .map((d) => `${d}s`)"
    >
      <a
        :class="'nav-link ' + (decade === d ? 'active' : '')"
        href="#"
        @click="() => setDecade(d)"
        >{{ d }}</a
      >
    </li>
  </ul>
</template>
