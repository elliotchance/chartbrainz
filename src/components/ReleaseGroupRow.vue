<script setup lang="ts">
import ReleaseCoverArt from "./ReleaseGroupCoverArt.vue";
import Date from "./Date.vue";
import ReleaseGroupLink from "./ReleaseGroupLink.vue";
import ArtistLink from "./ArtistLink.vue";
import GenreLinks from "./GenreLinks.vue";
import { ReleaseDate } from "../types";

const {
  number,
  releaseGroupId,
  releaseGroupTitle,
  firstReleaseDate,
  artistName,
  genres,
} = defineProps<{
  number: number;
  firstReleaseDate: ReleaseDate;
  releaseGroupId: string;
  releaseGroupTitle: string;
  artistName: string;
  genres: string[];
}>();
</script>

<template>
  {{ number }}.
  <ReleaseCoverArt :id="releaseGroupId" :title="releaseGroupTitle" />
  <Date :year="firstReleaseDate.year" :month="firstReleaseDate.month" :day="firstReleaseDate.day" />
  <ReleaseGroupLink :id="releaseGroupId" :title="releaseGroupTitle" />
  <ArtistLink :name="artistName" />
  <GenreLinks :genres="genres"></GenreLinks>
</template>
