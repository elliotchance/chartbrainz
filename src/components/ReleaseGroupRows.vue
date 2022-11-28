<script setup lang="ts">
import { ChartReleaseGroupResult } from "../types";
import ReleaseGroupRow from "./ReleaseGroupRow.vue";

const { results } = defineProps<{
  results: ChartReleaseGroupResult[];
}>();
</script>

<template>
  <div v-for="(result, i) in results">
    <ReleaseGroupRow
      :number="i + 1"
      :first-release-date="result.firstReleaseDate"
      :release-group-id="result.releaseGroup.id"
      :release-group-title="result.releaseGroup.title"
      :artist-name="result.artist.name"
      :genres="Object.keys(result.genres)"
    />
  </div>
</template>
